import React, { useState, useEffect } from "react";
import { getSettings, updateSettings, resetToDefaults } from "../../services/dataService";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminSettingsPage() {
  const { adminUser, logout } = useAdminAuth();
  const [settings, setSettings] = useState(null);
  const [siteTitle, setSiteTitle] = useState("");
  const [publicLocation, setPublicLocation] = useState("Pune, Maharashtra, India");
  const [enableRecruiterMode, setEnableRecruiterMode] = useState(true);
  const [showAvailabilityBadge, setShowAvailabilityBadge] = useState(true);
  const [primaryAccent, setPrimaryAccent] = useState("#38bdf8");
  const [secondaryAccent, setSecondaryAccent] = useState("#f59e0b");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await getSettings();
      setSettings(s);
      setSiteTitle(s?.siteTitle || "Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing");
      setPublicLocation(s?.publicLocation || "Pune, Maharashtra, India");
      setEnableRecruiterMode(s?.enableRecruiterMode ?? true);
      setShowAvailabilityBadge(s?.showAvailabilityBadge ?? true);
      setPrimaryAccent(s?.primaryAccent || "#38bdf8");
      setSecondaryAccent(s?.secondaryAccent || "#f59e0b");
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    await updateSettings({
      siteTitle,
      publicLocation,
      enableRecruiterMode,
      showAvailabilityBadge,
      primaryAccent,
      secondaryAccent
    });

    setIsSaving(false);
    setNotice("Global system settings updated successfully.");
    setTimeout(() => setNotice(""), 3000);
  };

  const handleReset = async () => {
    await resetToDefaults();
    setShowResetConfirm(false);
    setNotice("Platform data restored to verified initial defaults.");
    const s = await getSettings();
    setSettings(s);
    setSiteTitle(s.siteTitle);
    setPublicLocation(s.publicLocation);
    setEnableRecruiterMode(s.enableRecruiterMode);
    setShowAvailabilityBadge(s.showAvailabilityBadge);
    setTimeout(() => setNotice(""), 3500);
  };

  if (!settings) return <div className="admin-page">Loading settings...</div>;

  return (
    <div className="admin-page">
      <SEO title="System Settings — Admin CMS" description="Configure global portfolio variables and privacy options." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">SYSTEM &amp; GOVERNANCE</span>
          <h1 className="admin-page-title">Global Platform Settings</h1>
          <p className="admin-page-desc">
            Manage metadata titles, privacy configurations, feature switches, and data persistence controls.
          </p>
        </div>
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

      <div style={{ display: "grid", gap: "24px", maxWidth: "900px" }}>
        {/* General Settings */}
        <form onSubmit={handleSave} className="card" style={{ display: "grid", gap: "16px" }}>
          <h2 className="section-title-sm">General Metadata &amp; Privacy</h2>

          <div>
            <label className="admin-label">DEFAULT BROWSER WINDOW TITLE</label>
            <input
              type="text"
              required
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">PUBLIC CITY-LEVEL LOCATION (PRIVACY-PRESERVED)</label>
            <input
              type="text"
              required
              value={publicLocation}
              onChange={(e) => setPublicLocation(e.target.value)}
              className="admin-input"
            />
            <p style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "6px" }}>
              🔒 <strong>Strict Privacy Protocol:</strong> Only city/state level location is broadcast (&quot;Pune, Maharashtra, India&quot;). Never display residential street addresses.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div>
              <label className="admin-label">PRIMARY ACCENT COLOR (CYAN)</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="color"
                  value={primaryAccent}
                  onChange={(e) => setPrimaryAccent(e.target.value)}
                  style={{ width: "40px", height: "36px", borderRadius: "4px", border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={primaryAccent}
                  onChange={(e) => setPrimaryAccent(e.target.value)}
                  className="admin-input"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>
            </div>

            <div>
              <label className="admin-label">SECONDARY ACCENT COLOR (AMBER)</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="color"
                  value={secondaryAccent}
                  onChange={(e) => setSecondaryAccent(e.target.value)}
                  style={{ width: "40px", height: "36px", borderRadius: "4px", border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={secondaryAccent}
                  onChange={(e) => setSecondaryAccent(e.target.value)}
                  className="admin-input"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="enableRecruiter"
                checked={enableRecruiterMode}
                onChange={(e) => setEnableRecruiterMode(e.target.checked)}
              />
              <label htmlFor="enableRecruiter" style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-bright)" }}>
                Enable Dedicated Recruiter Mode Navigation &amp; Briefing Routes
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="showAvailability"
                checked={showAvailabilityBadge}
                onChange={(e) => setShowAvailabilityBadge(e.target.checked)}
              />
              <label htmlFor="showAvailability" style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-bright)" }}>
                Show Green &quot;Available for Opportunities&quot; Indicator
              </label>
            </div>
          </div>

          <div style={{ marginTop: "12px" }}>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Platform Settings"}
            </Button>
          </div>
        </form>

        {/* Administrator Credentials & Security */}
        <div className="card">
          <h2 className="section-title-sm" style={{ marginBottom: "12px" }}>Admin Session &amp; Security</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-bright)", fontWeight: "600" }}>
                Active Admin User: <span style={{ color: "var(--accent-cyan)" }}>{adminUser?.username || "ayyaj"}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                Session authorized via in-memory secure token. Role: superadmin.
              </div>
            </div>

            <Button onClick={logout} variant="outline" size="sm" style={{ color: "#f87171" }}>
              Sign Out ⎋
            </Button>
          </div>
        </div>

        {/* Danger Zone: Factory Reset */}
        <div className="card" style={{ border: "1px solid rgba(239, 68, 68, 0.4)", background: "rgba(239, 68, 68, 0.04)" }}>
          <div className="section-row-header">
            <div>
              <h2 className="section-title-sm" style={{ color: "#f87171" }}>
                Database Reset &amp; Defaults Restore
              </h2>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Reset all modifications back to verified factory defaults (projects, education, certifications, skills).
              </p>
            </div>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="btn btn-outline btn-sm"
                style={{ borderColor: "#f87171", color: "#f87171" }}
              >
                Reset to Defaults
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-sm"
                  style={{ background: "#ef4444", color: "#ffffff", border: "none", fontWeight: "700" }}
                >
                  Confirm Reset ⚠
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

