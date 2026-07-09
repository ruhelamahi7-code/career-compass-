# First Year Filter — Backend

Express API that generates a personalized 12-week career roadmap by calling
the Claude API (`claude-sonnet-4-6`), for the "First Year Filter" onboarding
form (Screen 1) to feed into `RoadmapView.jsx` (Screens 2 & 3).

## 1. Install dependencies

```bash
cd first-year-filter-backend
npm install
```

## 2. Add your API key

Copy the example env file and fill in your real key:

```bash
cp .env.example .env
```

Edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
PORT=3001
```

Get a key from https://console.anthropic.com/ if you don't have one.

## 3. Run the server

```bash
npm start
```

You should see:

```
First Year Filter backend running on http://localhost:3001
```

For auto-restart on file changes during the hackathon, use:

```bash
npm run dev
```

## 4. Test it

**Health check:**

```bash
curl http://localhost:3001/health
```

**Generate a roadmap:**

```bash
curl -X POST http://localhost:3001/generate-roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "year": "1st Year",
    "branch": "CSE",
    "goal": "Placement",
    "skills": "I know basic Python"
  }'
```

This returns exactly:

```json
{
  "roadmap": [
    {
      "week": 1,
      "theme": "...",
      "tasks": ["...", "...", "..."],
      "resource": { "title": "...", "url": "..." },
      "status": "not_started"
    }
    // ... through week 12
  ]
}
```

## 5. Connect the frontend

In Screen 1's submit handler, POST the form data to this endpoint and pass
the returned JSON straight into `RoadmapView.jsx`:

```javascript
const handleGenerateRoadmap = async (formData) => {
  const response = await fetch("http://localhost:3001/generate-roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData), // { year, branch, goal, skills }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to generate roadmap");
  }

  const data = await response.json(); // { roadmap: [...] }
  // pass data.roadmap (or data) into RoadmapView / localStorage as needed
  return data;
};
```

Since your dev servers run on different ports (Vite frontend, likely
`5173`, and this backend on `3001`), CORS is already enabled on the backend
so the browser won't block the request.

## How it works

1. `POST /generate-roadmap` validates the incoming body (`year`, `branch`,
   `goal`, `skills` all required).
2. It builds a prompt that asks Claude to calibrate the roadmap to the
   student's year/branch/goal/skill level and return **only** raw JSON in
   the agreed schema.
3. The response is parsed (stripping any accidental markdown fences) and
   validated: exactly 12 weeks, sequential week numbers, 2–3 tasks each,
   a valid resource object, and `status` force-normalized to
   `"not_started"`.
4. If the first response is malformed (rare, but LLMs can slip), the server
   automatically retries once with the specific validation error fed back
   to the model. If it still fails, the endpoint returns a `502` with
   details instead of silently sending broken data to the frontend.

## Notes for judges / teammates

- No database — this is a stateless generation endpoint. All persistence
  (progress, check-ins) already lives in `localStorage` on the frontend,
  per Screens 2 & 3.
- Model is pinned to `claude-sonnet-4-6` as specified.
- `max_tokens: 4096` comfortably fits a 12-week roadmap with 2-3 tasks per
  week; increase if you extend the schema later.
