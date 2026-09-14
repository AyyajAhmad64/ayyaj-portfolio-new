import React, { useState, useEffect } from "react";
import { getProfile, updateProfile, getSettings, updateSettings } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminHomePage() {
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [headline, setHeadline] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");
  const [showAvailability, setShowAvailability] = useState(true);
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [p, s] = await Promise.all([getProfile(), getSettings()]);
      setProfile(p);
      setSettings(s);
      setHeadline(p?.headline || "");
      setCurrentRole(p?.currentRole || "");
      setBio(p?.bio || "");
      setAvailability(p?.availability || "");
      setShowAvailability(s?.showAvailabilityBadge ?? true);
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    await Promise.all([
      updateProfile({
        headline,
        currentRole,
        bio,
        availability
      }),
      updateSettings({
        showAvailabilityBadge: showAvailability
      })
    ]);

    setIsSaving(false);
    setNotice("Home page configuration and Hero messaging saved successfully.");
    setTimeout(() => setNotice(""), 3000);
  };

  if (!profile || !settings) return <div className="admin-page">Loading Home page settings...</div>;

  return (
    <div className="admin-page">
      <SEO title="Home Page Configuration — Admin CMS" description="Manage homepage headline and hero messaging." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">PRIMARY ENTRYPOINT</span>
          <h1 className="admin-page-title">Home Page Management</h1>
          <p className="admin-page-desc">
            Configure the hero positioning statement, live status badge, and engineering focus presented to visitors.
          </p>
        </div>

        <Button to="/" target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
          View Live Home ↗
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
        <div className="card" style={{ display: "grid", gap: "16px" }}>
          <h2 className="section-title-sm">Hero Positioning &amp; Status</h2>

          <div>
            <label className="admin-label">ACTIVE ROLE / CURRENT STATUS BADGE</label>
            <input
              type="text"
              required
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="admin-input"
              placeholder="e.g. MERN Stack + AI Intern @ BQARLSON Software Pvt. Ltd."
            />
          </div>

          <div>
            <label className="admin-label">HERO HEADLINE (STACK &amp; SPECIALIZATION)</label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="admin-input"
              placeholder="Java • Spring Boot • React.js • ASP.NET Core • Cloud Computing"
            />
          </div>

          <div>
            <label className="admin-label">PRIMARY ELEVATOR PITCH / INTRO</label>
            <textarea
              rows={3}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="admin-textarea"
              placeholder="Building reliable full-stack applications with Java, Spring Boot, React.js..."
            />
          </div>

          <div>
            <label className="admin-label">OPPORTUNITY AVAILABILITY TEXT</label>
            <input
              type="text"
              required
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="admin-input"
              placeholder="Available for Software Engineering &amp; Cloud opportunities"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
            <input
              type="checkbox"
              id="showAvailability"
              checked={showAvailability}
              onChange={(e) => setShowAvailability(e.target.checked)}
            />
            <label htmlFor="showAvailability" style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent-cyan)" }}>
              Display live status badge &quot;Available for Opportunities&quot; on Hero
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Home Page Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

