import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminResumePage() {
  const [profile, setProfile] = useState(null);
  const [resumeDrive, setResumeDrive] = useState("");
  const [resumePdf, setResumePdf] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const p = await getProfile();
      setProfile(p);
      setResumeDrive(p?.contact?.resumeDrive || "");
      setResumePdf(p?.contact?.resumePdf || "");
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedContact = {
      ...profile.contact,
      resumeDrive,
      resumePdf
    };

    await updateProfile({ contact: updatedContact });
    setNotice("Resume URLs and download pathways updated successfully.");
    setIsSaving(false);
    setTimeout(() => setNotice(""), 3000);
  };

  if (!profile) return <div className="admin-page">Loading resume configuration...</div>;

  return (
    <div className="admin-page">
      <SEO title="Resume Configuration — Admin CMS" description="Configure resume documents and download links." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">DOCUMENTS &amp; CREDENTIALS</span>
          <h1 className="admin-page-title">Resume Configuration</h1>
          <p className="admin-page-desc">
            Manage your Google Drive public resume link, PDF file storage path, and public download triggers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {resumeDrive && (
            <Button href={resumeDrive} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
              Open Drive ↗
            </Button>
          )}
          {resumePdf && (
            <Button href={resumePdf.startsWith("/") ? resumePdf : `/${resumePdf}`} target="_blank" rel="noopener noreferrer" variant="primary" size="sm">
              View Local PDF ↗
            </Button>
          )}
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Configuration Form */}
        <div className="card">
          <h2 className="section-title-sm" style={{ marginBottom: "16px" }}>Resume Pathways</h2>
          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div>
              <label className="admin-label">GOOGLE DRIVE CLOUD SHARE URL</label>
              <input
                type="url"
                required
                value={resumeDrive}
                onChange={(e) => setResumeDrive(e.target.value)}
                className="admin-input"
                placeholder="https://drive.google.com/file/d/.../view"
              />
              <p style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "6px" }}>
                Primary link used for &quot;View on Google Drive&quot; buttons across the website and recruiter overview.
              </p>
            </div>

            <div>
              <label className="admin-label">LOCAL / STATIC PDF FILENAME</label>
              <input
                type="text"
                required
                value={resumePdf}
                onChange={(e) => setResumePdf(e.target.value)}
                className="admin-input"
                placeholder="Ayyaj Kalandar Shaikh - Resume.pdf"
              />
              <p style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "6px" }}>
                Filename placed in the public/ root directory for high-speed direct downloads and fallback embedding.
              </p>
            </div>

            <div style={{ marginTop: "12px" }}>
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Resume Pathways"}
              </Button>
            </div>
          </form>
        </div>

        {/* Verification Status Card */}
        <div className="card">
          <h2 className="section-title-sm" style={{ marginBottom: "16px" }}>Document Health Check</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ padding: "12px", background: "var(--bg-card-hover)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: "600" }}>DRIVE HOSTING</span>
                <span style={{ fontSize: "11px", color: "var(--accent-emerald)", fontWeight: "700" }}>ACTIVE</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-bright)", wordBreak: "break-all" }}>
                {resumeDrive}
              </div>
            </div>

            <div style={{ padding: "12px", background: "var(--bg-card-hover)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: "600" }}>LOCAL PDF FILE</span>
                <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>CONFIGURED</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-bright)" }}>
                {resumePdf}
              </div>
            </div>

            <div style={{ padding: "14px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "var(--radius-sm)", fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              💡 <strong>Pro-tip:</strong> Whenever you update your resume file, overwrite <code>public/{resumePdf}</code> or update the Google Drive file. No code recompilation is required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

