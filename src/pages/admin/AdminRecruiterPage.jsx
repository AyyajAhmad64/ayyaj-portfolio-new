import React, { useState, useEffect } from "react";
import { getRecruiterData, updateRecruiterData } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminRecruiterPage() {
  const [recruiter, setRecruiter] = useState(null);
  const [summary, setSummary] = useState("");
  const [availability, setAvailability] = useState("");
  const [targetRolesStr, setTargetRolesStr] = useState("");
  const [highlightsStr, setHighlightsStr] = useState("");
  const [metrics, setMetrics] = useState([]);
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getRecruiterData();
      setRecruiter(data);
      setSummary(data?.summary || "");
      setAvailability(data?.availability || "");
      setTargetRolesStr(Array.isArray(data?.targetRoles) ? data.targetRoles.join(", ") : "");
      setHighlightsStr(Array.isArray(data?.highlights) ? data.highlights.join("\n") : "");
      setMetrics(Array.isArray(data?.coreMetrics) ? data.coreMetrics : []);
    }
    load();
  }, []);

  const handleMetricChange = (index, field, value) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], [field]: value };
    setMetrics(updated);
  };

  const handleAddMetric = () => {
    setMetrics([...metrics, { label: "NEW METRIC", value: "Value", note: "Note" }]);
  };

  const handleRemoveMetric = (index) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      summary,
      availability,
      targetRoles: targetRolesStr.split(",").map((s) => s.trim()).filter(Boolean),
      highlights: highlightsStr.split("\n").map((s) => s.trim()).filter(Boolean),
      coreMetrics: metrics
    };

    await updateRecruiterData(payload);
    setIsSaving(false);
    setNotice("Recruiter portal configuration updated successfully.");
    setTimeout(() => setNotice(""), 3000);
  };

  if (!recruiter) return <div className="admin-page">Loading Recruiter configuration...</div>;

  return (
    <div className="admin-page">
      <SEO title="Recruiter Mode Configuration — Admin CMS" description="Manage recruiter executive dashboard and target metrics." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">TALENT ACQUISITION</span>
          <h1 className="admin-page-title">Recruiter Mode Settings</h1>
          <p className="admin-page-desc">
            Tailor the candidate briefing, target job titles, fast-scan bullet points, and core metrics for hiring managers.
          </p>
        </div>

        <Button to="/recruiter/overview" target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
          Preview Recruiter View ↗
        </Button>
      </div>

      {notice && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid var(--accent-emerald)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-emerald)",
            fontSize: "13px",
            marginBottom: "20px"
          }}
        >
          {notice}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "grid", gap: "24px", maxWidth: "900px" }}>
        {/* Elevator Pitch & Availability */}
        <div className="card" style={{ display: "grid", gap: "16px" }}>
          <h2 className="section-title-sm">Executive Candidate Briefing</h2>

          <div>
            <label className="admin-label">EXECUTIVE SUMMARY (RECRUITER OVERVIEW)</label>
            <textarea
              rows={4}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="admin-textarea"
              placeholder="Software Developer and MCA Cloud Computing student with practical experience..."
            />
          </div>

          <div>
            <label className="admin-label">AVAILABILITY / NOTICE TIMELINE</label>
            <input
              type="text"
              required
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="admin-input"
              placeholder="Immediate / Notice-free for Software Developer &amp; Engineering roles"
            />
          </div>

          <div>
            <label className="admin-label">TARGET ROLES (COMMA-SEPARATED)</label>
            <input
              type="text"
              required
              value={targetRolesStr}
              onChange={(e) => setTargetRolesStr(e.target.value)}
              className="admin-input"
              placeholder="Full Stack Developer, Software Developer, Java Backend Developer, Cloud Engineer"
            />
          </div>
        </div>

        {/* High Priority Highlights */}
        <div className="card" style={{ display: "grid", gap: "16px" }}>
          <h2 className="section-title-sm">Key Qualification Highlights (One per line)</h2>
          <div>
            <label className="admin-label">HIGH-IMPACT CAPABILITIES FOR SCREENING</label>
            <textarea
              rows={5}
              required
              value={highlightsStr}
              onChange={(e) => setHighlightsStr(e.target.value)}
              className="admin-textarea"
              placeholder="Enterprise Java &amp; Spring Boot backend engineering...&#10;Modern React.js frontend architecture..."
            />
          </div>
        </div>

        {/* Decision Metrics */}
        <div className="card" style={{ display: "grid", gap: "16px" }}>
          <div className="section-row-header">
            <h2 className="section-title-sm">Fast-Scan Core Metrics</h2>
            <Button type="button" onClick={handleAddMetric} variant="outline" size="sm">
              + Add Metric
            </Button>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {metrics.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.5fr 1.5fr auto",
                  gap: "10px",
                  alignItems: "center",
                  background: "var(--bg-card-hover)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div>
                  <label className="admin-label" style={{ fontSize: "10px", marginBottom: "4px" }}>LABEL</label>
                  <input
                    type="text"
                    required
                    value={m.label}
                    onChange={(e) => handleMetricChange(idx, "label", e.target.value)}
                    className="admin-input"
                    style={{ fontSize: "12px", padding: "6px 8px" }}
                  />
                </div>

                <div>
                  <label className="admin-label" style={{ fontSize: "10px", marginBottom: "4px" }}>VALUE</label>
                  <input
                    type="text"
                    required
                    value={m.value}
                    onChange={(e) => handleMetricChange(idx, "value", e.target.value)}
                    className="admin-input"
                    style={{ fontSize: "12px", padding: "6px 8px" }}
                  />
                </div>

                <div>
                  <label className="admin-label" style={{ fontSize: "10px", marginBottom: "4px" }}>SUB-NOTE</label>
                  <input
                    type="text"
                    value={m.note || ""}
                    onChange={(e) => handleMetricChange(idx, "note", e.target.value)}
                    className="admin-input"
                    style={{ fontSize: "12px", padding: "6px 8px" }}
                  />
                </div>

                <div style={{ paddingTop: "16px" }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveMetric(idx)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "#f87171" }}
                    aria-label="Remove metric"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Recruiter Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}

