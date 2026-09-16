import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/dataService";
import { uploadResumeVersion, fetchResumeVersionsList } from "../../services/supabaseService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminResumePage() {
  const [profile, setProfile] = useState(null);
  const [resumeDrive, setResumeDrive] = useState("");
  const [resumePdf, setResumePdf] = useState("");
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeVersions, setResumeVersions] = useState([]);
  const [versionNotes, setVersionNotes] = useState("");

  const loadData = async () => {
    const p = await getProfile();
    setProfile(p);
    setResumeDrive(p?.contact?.resumeDrive || "");
    setResumePdf(p?.contact?.resumePdf || "");

    if (isSupabaseConfigured()) {
      const versions = await fetchResumeVersionsList();
      if (versions) setResumeVersions(versions);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorNotice("");
    setNotice("");

    try {
      const updatedContact = {
        ...profile.contact,
        resumeDrive,
        resumePdf
      };

      await updateProfile({ contact: updatedContact });
      setNotice("Resume URLs and download pathways updated successfully.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to update resume pathways:", err);
      setErrorNotice(err.message || "Cloud save failed. Your changes were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setErrorNotice("");
    setNotice("");

    if (!isSupabaseConfigured()) {
      setIsUploading(false);
      setErrorNotice("Cloud save failed: Supabase is not configured. Local fallback is disabled.");
      return;
    }

    try {
      const vNum = `v${new Date().getFullYear()}.${resumeVersions.length + 1}`;
      const newVersion = await uploadResumeVersion(file, vNum, versionNotes || "Admin upload");
      if (newVersion?.file_url) {
        setResumePdf(newVersion.file_url);
        const updatedContact = {
          ...profile.contact,
          resumePdf: newVersion.file_url
        };
        await updateProfile({ contact: updatedContact });
        await loadData();
        setNotice(`Resume PDF uploaded to Supabase Storage: ${vNum}`);
        setTimeout(() => setNotice(""), 3000);
        return;
      }
      throw new Error("Upload succeeded but failed to return a valid cloud storage URL.");
    } catch (err) {
      console.error("Failed to upload resume to Supabase:", err);
      setErrorNotice(`Cloud upload failed: ${err.message || "Unknown error"}. Your changes were not saved.`);
    } finally {
      setIsUploading(false);
    }
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
            Manage your Google Drive public resume link, upload versioned PDF files to Supabase Cloud Storage (resume bucket), and configure public download triggers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {resumeDrive && (
            <Button href={resumeDrive} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
              Open Drive ↗
            </Button>
          )}
          {resumePdf && (
            <Button
              href={resumePdf.startsWith("http") ? resumePdf : (resumePdf.startsWith("/") ? resumePdf : `/${resumePdf}`)}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="sm"
            >
              View Active PDF ↗
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

      {errorNotice && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid var(--accent-rose)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-rose)",
            fontSize: "13px",
            marginBottom: "20px"
          }}
        >
          {errorNotice}
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
              <label className="admin-label">ACTIVE RESUME PDF URL OR PATH</label>
              <input
                type="text"
                required
                value={resumePdf}
                onChange={(e) => setResumePdf(e.target.value)}
                className="admin-input"
                placeholder="https://...supabase.co/... or Ayyaj Kalandar Shaikh - Resume.pdf"
              />
              <p style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "6px" }}>
                Cloud storage URL or filename in public/ root used for instant downloads.
              </p>
            </div>

            {/* Direct PDF Upload to Supabase */}
            <div style={{ padding: "14px", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
              <label className="admin-label" style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>
                UPLOAD NEW PDF RESUME TO SUPABASE STORAGE
              </label>
              <div style={{ marginBottom: "8px" }}>
                <input
                  type="text"
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  placeholder="Optional version notes (e.g. Added MERN & Cloud MCA highlights)"
                  className="admin-input"
                  style={{ fontSize: "12px", marginBottom: "8px" }}
                />
              </div>
              <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>📁 {isUploading ? "Uploading to Cloud..." : "Select & Upload PDF"}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={isUploading}
                  style={{ display: "none" }}
                  onChange={handlePdfUpload}
                />
              </label>
            </div>

            <div style={{ marginTop: "8px" }}>
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Resume Pathways"}
              </Button>
            </div>
          </form>
        </div>

        {/* Verification Status Card & Versions List */}
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
                <span style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: "600" }}>PDF STORAGE PATH</span>
                <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>
                  {resumePdf.startsWith("http") ? "SUPABASE CLOUD" : "LOCAL ASSET"}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-bright)", wordBreak: "break-all" }}>
                {resumePdf}
              </div>
            </div>

            {resumeVersions.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <h3 style={{ fontSize: "13px", color: "var(--text-bright)", marginBottom: "8px", fontWeight: "700" }}>
                  Cloud Storage Versions ({resumeVersions.length})
                </h3>
                <div style={{ display: "grid", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
                  {resumeVersions.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        padding: "8px 10px",
                        background: v.is_active ? "rgba(56, 189, 248, 0.12)" : "var(--bg-base)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-bright)" }}>
                          {v.version}
                        </span>
                        {v.is_active && (
                          <span style={{ fontSize: "10px", color: "var(--accent-cyan)", marginLeft: "6px", fontWeight: "700" }}>
                            [ACTIVE]
                          </span>
                        )}
                        <p style={{ fontSize: "11px", color: "var(--text-dim)", margin: "2px 0 0" }}>
                          {v.title} {v.notes ? `• ${v.notes}` : ""}
                        </p>
                      </div>
                      <a
                        href={v.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: "11px" }}
                      >
                        View ↗
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
