import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "⚠️  ANTHROPIC_API_KEY is not set. Add it to a .env file before calling /generate-roadmap."
  );
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-6";

// ---------- Prompt building ----------

function buildPrompt({ year, branch, goal, skills }) {
  return `You are a career mentor for engineering students in India, designing a personalized 12-week roadmap.

Student profile:
- Year: ${year}
- Branch: ${branch}
- Goal: ${goal}
- Current skills / background (in their own words): ${skills}

Design a 12-week roadmap calibrated to this exact profile:
- If the student is early-year (1st/2nd year) and a beginner, start with fundamentals (programming basics, DSA foundations, tools/version control) before moving to applied/project work in later weeks.
- If the student already claims stronger skills, skip basics and go straight into intermediate/advanced topics, projects, and goal-specific prep (e.g. placement prep = DSA + projects + resume + mock interviews; higher studies = research/GRE/papers; startup = building + shipping projects).
- Tie themes to their branch (${branch}) and stated goal (${goal}) wherever relevant, not just generic "learn to code" advice.
- Weeks should progress logically: foundational weeks first, then applied/project weeks, then goal-specific prep and portfolio/interview readiness in the final 2-3 weeks.
- Each week's 2-3 tasks must be concrete and actionable (name specific concepts, tools, or deliverables), not vague ("read documentation" is too vague; "read the official React docs section on Hooks and build a counter component" is good).
- Each week must include exactly ONE real, well-known, high-quality learning resource (a real course, official docs, a well-known YouTube channel/playlist, or a reputable article) with a real, plausible URL. Do not invent fake domains.

Respond with ONLY valid JSON in exactly this shape, and nothing else — no markdown code fences, no commentary, no explanation before or after:

{
  "roadmap": [
    {
      "week": 1,
      "theme": "string",
      "tasks": ["string", "string", "string"],
      "resource": {
        "title": "string",
        "url": "string"
      },
      "status": "not_started"
    }
  ]
}

Rules:
- The "roadmap" array must contain exactly 12 objects, with "week" values 1 through 12 in order.
- "tasks" must be an array of 2 or 3 strings.
- "status" must always be the literal string "not_started".
- Output raw JSON only. Do not wrap it in \`\`\`json or any other text.`;
}

// ---------- Response parsing & validation ----------

function extractJson(text) {
  // Strip common markdown code fences if the model adds them anyway.
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");

  // Fallback: grab the first balanced {...} block in case there's stray text.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

function validateRoadmap(parsed) {
  if (!parsed || !Array.isArray(parsed.roadmap)) {
    return "Missing top-level 'roadmap' array";
  }
  if (parsed.roadmap.length !== 12) {
    return `Expected 12 weeks, got ${parsed.roadmap.length}`;
  }

  for (let i = 0; i < parsed.roadmap.length; i++) {
    const w = parsed.roadmap[i];
    const expectedWeek = i + 1;

    if (typeof w.week !== "number" || w.week !== expectedWeek) {
      return `Week at index ${i} has invalid 'week' value (expected ${expectedWeek})`;
    }
    if (typeof w.theme !== "string" || !w.theme.trim()) {
      return `Week ${expectedWeek} missing 'theme'`;
    }
    if (!Array.isArray(w.tasks) || w.tasks.length < 2 || w.tasks.length > 3) {
      return `Week ${expectedWeek} 'tasks' must be an array of 2-3 strings`;
    }
    if (!w.tasks.every((t) => typeof t === "string" && t.trim())) {
      return `Week ${expectedWeek} has an empty/invalid task`;
    }
    if (
      !w.resource ||
      typeof w.resource.title !== "string" ||
      typeof w.resource.url !== "string" ||
      !w.resource.title.trim() ||
      !w.resource.url.trim()
    ) {
      return `Week ${expectedWeek} missing valid 'resource' (title + url)`;
    }
    // Normalize status regardless of what the model returned.
    w.status = "not_started";
  }

  return null; // null means valid
}

async function callClaudeForRoadmap(profile, { retryHint } = {}) {
  const prompt = buildPrompt(profile);
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: retryHint
          ? `${prompt}\n\nIMPORTANT: Your previous response was invalid because: ${retryHint}. Return ONLY the corrected raw JSON object, nothing else.`
          : prompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("No text content returned from Claude");
  }

  return extractJson(textBlock.text);
}

// ---------- Route ----------

app.post("/generate-roadmap", async (req, res) => {
  const { year, branch, goal, skills } = req.body || {};

  if (!year || !branch || !goal || !skills) {
    return res.status(400).json({
      error:
        "Missing required fields. Expected: year, branch, goal, skills (all strings).",
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "Server misconfiguration: ANTHROPIC_API_KEY is not set.",
    });
  }

  const profile = { year, branch, goal, skills };

  try {
    let parsed;
    let error;

    try {
      parsed = await callClaudeForRoadmap(profile);
      error = validateRoadmap(parsed);
    } catch (e) {
      error = e.message;
    }

    // One retry with explicit feedback if the first attempt was malformed.
    if (error) {
      console.warn("First roadmap attempt invalid, retrying:", error);
      try {
        parsed = await callClaudeForRoadmap(profile, { retryHint: error });
        error = validateRoadmap(parsed);
      } catch (e) {
        error = e.message;
      }
    }

    if (error) {
      console.error("Roadmap generation failed after retry:", error);
      return res.status(502).json({
        error: "Failed to generate a valid roadmap from the AI model.",
        details: error,
      });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Unexpected error generating roadmap:", err);
    return res.status(500).json({
      error: "Unexpected server error while generating roadmap.",
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`First Year Filter backend running on http://localhost:${PORT}`);
});
