import React, { useState } from "react";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import { queryJARVIS, quickQuestions } from "../../services/aiKnowledgeService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminJarvisPage() {
  const portfolioData = usePortfolioData();
  const { profile, projects = [], experience = [], education = [], skills = [], certifications = [] } = portfolioData;

  const [inputQuery, setInputQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [testHistory, setTestHistory] = useState([]);

  const handleTestQuery = async (queryToRun) => {
    const q = (queryToRun || inputQuery).trim();
    if (!q) return;

    setLoading(true);
    setResponse("");

    const answer = await queryJARVIS(q, [], portfolioData);
    setLoading(false);
    setResponse(answer);
    setTestHistory((prev) => [{ q, a: answer, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
  };

  return (
    <div className="admin-page">
      <SEO title="JARVIS Intelligence CMS — Admin CMS" description="Manage and verify JARVIS AI knowledge grounding." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">AI / INTELLIGENCE</span>
          <h1 className="admin-page-title">JARVIS Knowledge &amp; Grounding Center</h1>
          <p className="admin-page-desc">
            Verify real-time knowledge grounding for JARVIS. All public inquiries are answered dynamically from live Supabase portfolio data without static hallucinations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button to="/about" target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
            Live Portfolio ↗
          </Button>
        </div>
      </div>

      {/* Live Data Grounding Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>PROFILE STATUS</span>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {profile ? "Active (Supabase)" : "Loading..."}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{profile?.currentRole || "N/A"}</span>
        </div>

        <div className="card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: "700" }}>PROJECTS INDEXED</span>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {projects.length}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Active Case Studies</span>
        </div>

        <div className="card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-emerald)", fontWeight: "700" }}>EXPERIENCE RECORDS</span>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {experience.length}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Employment / Internships</span>
        </div>

        <div className="card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>SKILL CATEGORIES</span>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {skills.length}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Verified Domains</span>
        </div>

        <div className="card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: "700" }}>EDUCATION RECORDS</span>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {education.length}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Academic Degrees</span>
        </div>
      </div>

      {/* Interactive Intent Tester */}
      <div className="card" style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
        <h2 className="section-title-sm">Interactive Intent &amp; Grounding Tester</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "-8px 0 8px" }}>
          Type any query or click a preset benchmark test below to verify that intent routing retrieves the exact live Supabase entities.
        </p>

        {/* Quick Benchmark Tests */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {[
            "What is Ayyaj's work experience?",
            "What is his professional overview?",
            "What projects has he built?",
            "Tell me about Nexora",
            "What is his educational background?",
            "What is his primary technical stack?",
            "Where is he located?"
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setInputQuery(preset);
                handleTestQuery(preset);
              }}
              style={{ fontSize: "12px" }}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTestQuery()}
            placeholder="e.g. What is Ayyaj's work experience?"
            className="admin-input"
            style={{ flex: 1 }}
          />
          <Button onClick={() => handleTestQuery()} variant="primary" disabled={loading || !inputQuery.trim()}>
            {loading ? "Querying..." : "Execute Test →"}
          </Button>
        </div>

        {/* Response Box */}
        {response && (
          <div
            style={{
              marginTop: "12px",
              padding: "16px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--accent-cyan)",
              borderRadius: "var(--radius-sm)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                JARVIS RESPONSE PREVIEW
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Grounded in live Supabase data</span>
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--text-main)", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
              {response}
            </div>
          </div>
        )}
      </div>

      {/* Grounding Guarantees Info */}
      <div className="card" style={{ display: "grid", gap: "12px" }}>
        <h2 className="section-title-sm">Factual Grounding Architecture</h2>
        <ul style={{ paddingLeft: "20px", margin: 0, display: "grid", gap: "8px", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
          <li>
            <strong style={{ color: "var(--text-bright)" }}>Work Experience Priority:</strong> Inquiries asking for work experience, companies worked at, or internships strictly route to the live <code>experiences</code> table, never confusing them with independent portfolio projects.
          </li>
          <li>
            <strong style={{ color: "var(--text-bright)" }}>Dynamic Updates:</strong> Any edit made to Projects, Experience, Education, or About in this CMS is instantly available to JARVIS queries without server redeployments.
          </li>
          <li>
            <strong style={{ color: "var(--text-bright)" }}>Privacy Protection:</strong> JARVIS never discloses private residential street numbers or personal addresses. Only the public location (<code>{profile?.location || "Hinjawadi, Pune, Maharashtra, India"}</code>) is reported.
          </li>
          <li>
            <strong style={{ color: "var(--text-bright)" }}>No Hallucinations:</strong> If specific requested information is missing from the database, JARVIS clearly informs the user that the record is not available rather than guessing.
          </li>
        </ul>
      </div>
    </div>
  );
}
