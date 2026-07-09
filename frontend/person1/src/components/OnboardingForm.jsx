import { useState, useEffect } from "react";

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const branches = ["CSE", "IT", "ECE", "ME", "Civil", "Other"];
const goals = [
  { name: "Placement", icon: "💼", desc: "Land your dream job" },
  { name: "Startup", icon: "🚀", desc: "Build something big" },
  { name: "Research", icon: "🔬", desc: "Push boundaries" },
  { name: "Study Abroad", icon: "✈️", desc: "Go global" },
];
const steps = ["Profile", "Goal", "Skills"];

export default function OnboardingForm({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [particles, setParticles] = useState([]);
  const [form, setForm] = useState({ year: "", branch: "", goal: "", skills: "" });

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    const p = Array.from({ length: 35 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 1, duration: Math.random() * 10 + 8, delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const next = () => {
    if (step === 0 && (!form.year || !form.branch)) { setError("Please select year and branch"); return; }
    if (step === 1 && !form.goal) { setError("Please select a goal"); return; }
    setError(""); setStep(step + 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const profile = {
        year: form.year, branch: form.branch, goal: form.goal,
        skills: form.skills ? form.skills.split(",").map(s => s.trim()) : []
      };
      const res = await fetch("http://localhost:3001/generate-roadmap", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      onSubmit(profile, data);
    } catch (e) {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        html { -webkit-text-size-adjust: 100%; }
        body { position: fixed; width: 100%; height: 100%; top: 0; left: 0; }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; margin: 0 !important; padding: 0 !important; overflow: hidden; }
        #root { height: 100%; margin: 0 !important; padding: 0 !important; display: flex; flex-direction: column; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:0.7} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        
        .ch:hover { transform:translateY(-3px) scale(1.01) !important; border-color:rgba(139,92,246,0.7) !important; background:rgba(139,92,246,0.14) !important; }
        .ch { transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important; cursor: pointer; }
        
        .pbtn:hover { transform:translateY(-2px) !important; box-shadow:0 15px 30px rgba(139,92,246,0.5) !important; filter: brightness(1.1); }
        .pbtn:active { transform:translateY(0px) !important; }
        .pbtn { transition: all 0.2s ease !important; }
        
        .ifield:focus { border-color:rgba(139,92,246,0.6) !important; box-shadow:0 0 0 3px rgba(139,92,246,0.15) !important; outline:none !important; background: rgba(139,92,246,0.05) !important; }
        select option { background:#120d2a; color:white; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
      `}</style>

      <div style={{ width:"100%", height:"100%", minHeight:"100vh", background:"#06020f", position:"fixed", inset:0, overflow:"auto", fontFamily:"'Inter',sans-serif", color:"white", display:"flex" }}>

        {/* Background orbs */}
        <div style={{ position:"fixed", width:800, height:800, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.13),transparent 65%)", top:-300, left:-200, pointerEvents:"none" }} />
        <div style={{ position:"fixed", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.1),transparent 65%)", bottom:-250, right:-150, pointerEvents:"none" }} />
        <div style={{ position:"fixed", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(236,72,153,0.07),transparent 65%)", top:"40%", left:"45%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />

        {/* Grid */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(139,92,246,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.025) 1px,transparent 1px)", backgroundSize:"70px 70px" }} />

        {/* Particles */}
        {particles.map(p => (
          <div key={p.id} style={{ position:"fixed", left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size, borderRadius:"50%", background:"rgba(139,92,246,0.5)", pointerEvents:"none", animation:`float ${p.duration}s ease-in-out ${p.delay}s infinite, pulse ${p.duration*0.7}s ease-in-out ${p.delay}s infinite` }} />
        ))}

        {/* MAIN GRID */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", width:"100%", height:"100vh", position:"relative", zIndex:1, alignItems:"stretch" }}>

          {/* ── LEFT ── */}
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 60px 0 80px", minHeight:"100vh", animation:"fadeUp 0.8s ease forwards" }}>

            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:100, padding:"7px 18px", marginBottom:36, width:"fit-content" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#8b5cf6", animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:11, color:"#a78bfa", fontWeight:700, letterSpacing:3 }}>AI CAREER NAVIGATOR</span>
            </div>

            <h1 style={{ fontSize:82, fontWeight:900, lineHeight:1.04, marginBottom:24, letterSpacing:-2.5 }}>
              Your Career<br />
              <span style={{ background:"linear-gradient(135deg,#8b5cf6,#a78bfa,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundSize:"200% auto", animation:"shimmer 3s linear infinite" }}>
                Starts Here.
              </span>
            </h1>

            <p style={{ color:"#94a3b8", fontSize:20, lineHeight:1.8, maxWidth:480, marginBottom:48 }}>
              Stop googling "what to learn". Get a personalized 12-week roadmap built for exactly where you are right now.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:44 }}>
              {[
                { week:"Week 1–2",  title:"Foundation Setup", color:"#8b5cf6" },
                { week:"Week 3–5",  title:"Core Skills",      color:"#60a5fa" },
                { week:"Week 6–9",  title:"Build Projects",   color:"#34d399" },
                { week:"Week 10–12",title:"Apply & Grow",     color:"#f472b6" },
              ].map((item, i) => (
                <div key={i} className="ch" style={{ display:"flex", alignItems:"center", gap:18, padding:"15px 22px", borderRadius:16, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:item.color, flexShrink:0, boxShadow:`0 0 12px ${item.color}` }} />
                  <span style={{ color:"#64748b", fontSize:14, minWidth:82, fontWeight:600 }}>{item.week}</span>
                  <span style={{ color:"#e2e8f0", fontSize:16, fontWeight:500 }}>{item.title}</span>
                  <div style={{ marginLeft:"auto", width:64, height:3, borderRadius:2, background:`linear-gradient(90deg,${item.color},transparent)` }} />
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:44 }}>
              {[["12","Weeks"],["3+","Tasks/Week"],["100%","Free"]].map(([num,label]) => (
                <div key={label}>
                  <div style={{ fontSize:38, fontWeight:800, background:"linear-gradient(135deg,#8b5cf6,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{num}</div>
                  <div style={{ fontSize:14, color:"#64748b", marginTop:3, fontWeight:500 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 80px 40px 20px" }}>
            <div style={{ width:"100%", maxWidth:560, padding:"44px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:30, backdropFilter:"blur(40px)", animation:"fadeUp 0.8s ease 0.15s both" }}>

              {/* Step bar */}
              <div style={{ display:"flex", gap:10, marginBottom:36 }}>
                {steps.map((s,i) => (
                  <div key={i} style={{ flex:1 }}>
                    <div style={{ height:3, borderRadius:2, marginBottom:7, background: i < step ? "#8b5cf6" : i === step ? "linear-gradient(90deg,#7c3aed,#a78bfa)" : "rgba(255,255,255,0.07)", transition:"all 0.4s ease" }} />
                    <span style={{ fontSize:11, color: i===step ? "#a78bfa" : "#475569", fontWeight: i===step ? 600 : 500, letterSpacing: 0.5 }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* STEP 0 */}
              {step === 0 && (
                <div style={{ animation:"fadeUp 0.35s ease" }}>
                  <h2 style={{ fontSize:28, fontWeight:700, marginBottom:6, color: "#f8fafc" }}>Tell us about yourself</h2>
                  <p style={{ color:"#94a3b8", fontSize:16, marginBottom:28 }}>We'll tailor everything to your situation.</p>

                  <p style={{ fontSize:12, color:"#94a3b8", marginBottom:12, fontWeight:700, letterSpacing:1.5 }}>WHICH YEAR?</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
                    {years.map(y => (
                      <div key={y} className="ch" onClick={() => update("year", y)} style={{ padding:"16px", borderRadius:14, textAlign:"center", fontSize:15, fontWeight:600, border: form.year===y ? "1px solid #8b5cf6" : "1px solid rgba(255,255,255,0.07)", background: form.year===y ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.02)", color: form.year===y ? "#c084fc" : "#cbd5e1" }}>{y}</div>
                    ))}
                  </div>

                  <p style={{ fontSize:12, color:"#94a3b8", marginBottom:12, fontWeight:700, letterSpacing:1.5 }}>YOUR BRANCH</p>
                  <select value={form.branch} onChange={e => update("branch", e.target.value)} className="ifield" style={{ width:"100%", padding:"15px 18px", borderRadius:14, background:"rgba(255,255,255,0.04)", color: form.branch ? "white" : "#64748b", border:"1px solid rgba(255,255,255,0.08)", fontSize:15, boxSizing:"border-box", transition: "all 0.2s" }}>
                    <option value="" disabled hidden>Select your branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <div style={{ animation:"fadeUp 0.35s ease" }}>
                  <h2 style={{ fontSize:28, fontWeight:700, marginBottom:6, color: "#f8fafc" }}>What's your goal?</h2>
                  <p style={{ color:"#94a3b8", fontSize:16, marginBottom:28 }}>This shapes your entire roadmap.</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    {goals.map(g => (
                      <div key={g.name} className="ch" onClick={() => update("goal", g.name)} style={{ padding:"22px 16px", borderRadius:18, textAlign:"center", border: form.goal===g.name ? "1px solid #8b5cf6" : "1px solid rgba(255,255,255,0.07)", background: form.goal===g.name ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.02)" }}>
                        <div style={{ fontSize:32, marginBottom:10 }}>{g.icon}</div>
                        <div style={{ fontSize:15, fontWeight:600, color: form.goal===g.name ? "#c084fc" : "#cbd5e1", marginBottom:5 }}>{g.name}</div>
                        <div style={{ fontSize:13, color:"#94a3b8" }}>{g.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div style={{ animation:"fadeUp 0.35s ease" }}>
                  <h2 style={{ fontSize:28, fontWeight:700, marginBottom:6, color: "#f8fafc" }}>Current skills</h2>
                  <p style={{ color:"#94a3b8", fontSize:16, marginBottom:24 }}>Be honest. Starting from zero is completely fine.</p>
                  <textarea rows={5} value={form.skills} onChange={e => update("skills", e.target.value)}
                    placeholder={"e.g. Python basics, HTML, a little C++\n\nLeave blank if starting from zero."} className="ifield"
                    style={{ width:"100%", padding:"16px", borderRadius:14, resize:"none", background:"rgba(255,255,255,0.04)", color:"white", border:"1px solid rgba(255,255,255,0.08)", fontSize:15, lineHeight:1.7, boxSizing:"border-box", transition: "all 0.2s" }} />
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14 }}>
                    {["Python","HTML/CSS","C++","None yet"].map(s => (
                      <span key={s} onClick={() => update("skills", form.skills ? form.skills+", "+s : s)}
                        style={{ padding:"6px 14px", borderRadius:100, fontSize:12, cursor:"pointer", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.3)", background:"rgba(139,92,246,0.08)", transition: "all 0.2s" }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(139,92,246,0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(139,92,246,0.08)'}>
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && <p style={{ color:"#f87171", fontSize:13, marginTop:16, fontWeight: 500 }}>⚠️ {error}</p>}

              {/* FIXED BUTTONS CONTAINER */}
              <div style={{ display: "flex", gap: "10px", marginTop: "30px", width: "100%" }}>
                {step > 0 && (
                  <button onClick={() => setStep(step-1)} style={{ flex: 1, padding:"15px", borderRadius:14, cursor:"pointer", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#cbd5e1", fontSize:14, fontWeight: 500, transition:"all 0.2s" }} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}>← Back</button>
                )}
                <button className="pbtn" onClick={step===2 ? submit : next} disabled={loading} style={{ flex: 1, padding:"16px", borderRadius:14, cursor: loading?"not-allowed":"pointer", background:"linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa)", border:"none", color:"white", fontSize:16, fontWeight:600, boxShadow:"0 8px 28px rgba(139,92,246,0.35)" }}>
                  {loading ? (
                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }} />
                      Generating...
                    </span>
                  ) : step===2 ? "Generate My Roadmap 🚀" : "Continue →"}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}