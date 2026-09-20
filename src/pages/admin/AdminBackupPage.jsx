import React, { useState, useEffect } from "react";
import {
  getProjects,
  getExperience,
  getEducation,
  getSkills,
  getCertifications,
  getAchievements,
  getGallery,
  getProfile,
  getSettings,
  getRecruiterData,
  getMedia,
  saveProject,
  saveExperience,
  saveEducation,
  saveSkills,
  saveCertification,
  saveAchievement,
  saveGalleryItem,
  updateProfile,
  updateSettings,
  updateRecruiterData
} from "../../services/dataService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { recordAuditLog } from "../../services/supabaseService";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminBackupPage() {
  const { refresh } = usePortfolioData();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState("merge"); // "merge" | "overwrite"

  const loadCounts = async () => {
    try {
      setLoading(true);
      const [projs, exp, edu, skills, certs, ach, gal, prof, settings, recruiter, media] =
        await Promise.all([
          getProjects(),
          getExperience(),
          getEducation(),
          getSkills(),
          getCertifications(),
          getAchievements(),
          getGallery(),
          getProfile(),
          getSettings(),
          getRecruiterData(),
          getMedia()
        ]);

      setCounts({
        projects: projs?.length || 0,
        experience: exp?.length || 0,
        education: edu?.length || 0,
        skills: skills?.length || 0,
        certifications: certs?.length || 0,
        achievements: ach?.length || 0,
        gallery: gal?.length || 0,
        profile: prof ? 1 : 0,
        settings: settings ? 1 : 0,
        recruiter: recruiter ? 1 : 0,
        media: media?.length || 0
      });
    } catch (err) {
      console.error("Failed to load counts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const handleExport = async () => {
    try {
      setNotice("");
      setErrorNotice("");
      const [projs, exp, edu, skills, certs, ach, gal, prof, settings, recruiter, media] =
        await Promise.all([
          getProjects(),
          getExperience(),
          getEducation(),
          getSkills(),
          getCertifications(),
          getAchievements(),
          getGallery(),
          getProfile(),
          getSettings(),
          getRecruiterData(),
          getMedia()
        ]);

      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

      const payload = {
        metadata: {
          version: "2.0.0",
          schema: "ayyaj-portfolio-cms",
          exportDate: now.toISOString(),
          timestamp,
          isCloud: isSupabaseConfigured(),
          totalEntities:
            (projs?.length || 0) +
            (exp?.length || 0) +
            (edu?.length || 0) +
            (skills?.length || 0) +
            (certs?.length || 0) +
            (ach?.length || 0) +
            (gal?.length || 0)
        },
        collections: {
          profile: prof || {},
          settings: settings || {},
          recruiter: recruiter || {},
          projects: projs || [],
          experience: exp || [],
          education: edu || [],
          skills: skills || [],
          certifications: certs || [],
          achievements: ach || [],
          gallery: gal || [],
          media: media || []
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `portfolio-backup-${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      await recordAuditLog("EXPORT_BACKUP", "system", null, { timestamp, totalEntities: payload.metadata.totalEntities });
      setNotice(`Backup successfully generated and downloaded: portfolio-backup-${timestamp}.json`);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      console.error("Export failed:", err);
      setErrorNotice(err.message || "Failed to generate backup export.");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.collections && !parsed.projects) {
          throw new Error("Invalid backup file: missing 'collections' payload.");
        }
        setImportFile(file);
        setImportData(parsed);
        setImportModalOpen(true);
      } catch (err) {
        console.error("Failed to parse JSON backup:", err);
        setErrorNotice(`Failed to parse backup JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const executeImport = async () => {
    if (!importData) return;
    setIsImporting(true);
    setErrorNotice("");
    setNotice("");

    try {
      const cols = importData.collections || importData;
      let countImported = 0;

      // 1. Profile
      if (cols.profile && Object.keys(cols.profile).length > 0) {
        await updateProfile(cols.profile);
        countImported++;
      }

      // 2. Settings
      if (cols.settings && Object.keys(cols.settings).length > 0) {
        await updateSettings(cols.settings);
        countImported++;
      }

      // 3. Recruiter
      if (cols.recruiter && Object.keys(cols.recruiter).length > 0) {
        await updateRecruiterData(cols.recruiter);
        countImported++;
      }

      // 4. Projects
      if (Array.isArray(cols.projects)) {
        for (const p of cols.projects) {
          await saveProject(p);
          countImported++;
        }
      }

      // 5. Experience
      if (Array.isArray(cols.experience)) {
        for (const ex of cols.experience) {
          await saveExperience(ex);
          countImported++;
        }
      }

      // 6. Education
      if (Array.isArray(cols.education)) {
        for (const ed of cols.education) {
          await saveEducation(ed);
          countImported++;
        }
      }

      // 7. Skills
      if (Array.isArray(cols.skills) && cols.skills.length > 0) {
        await saveSkills(cols.skills);
        countImported += cols.skills.length;
      }

      // 8. Certifications
      if (Array.isArray(cols.certifications)) {
        for (const c of cols.certifications) {
          await saveCertification(c);
          countImported++;
        }
      }

      // 9. Achievements
      if (Array.isArray(cols.achievements)) {
        for (const a of cols.achievements) {
          await saveAchievement(a);
          countImported++;
        }
      }

      // 10. Gallery
      if (Array.isArray(cols.gallery)) {
        for (const g of cols.gallery) {
          await saveGalleryItem(g);
          countImported++;
        }
      }

      if (refresh) await refresh();
      await loadCounts();
      await recordAuditLog("IMPORT_BACKUP", "system", null, {
        fileName: importFile?.name,
        countImported,
        mode: importMode
      });

      setImportModalOpen(false);
      setImportFile(null);
      setImportData(null);
      setNotice(`Successfully imported ${countImported} CMS entities from backup!`);
      setTimeout(() => setNotice(""), 5000);
    } catch (err) {
      console.error("Import failed:", err);
      setErrorNotice(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const incomingCollections = importData ? (importData.collections || importData) : {};

  return (
    <div className="admin-page">
      <SEO title="Backup & Recovery — Admin CMS" description="Export and import complete CMS backups." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">SYSTEM / DATA PRESERVATION</span>
          <h1 className="admin-page-title">Backup &amp; Recovery</h1>
          <p className="admin-page-desc">
            Safely snapshot, export, and restore complete portfolio content across all collections to immutable JSON archives.
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* Export Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>💾</span>
            <div>
              <h2 style={{ fontSize: "16px", color: "var(--text-bright)", margin: 0 }}>Export Snapshot</h2>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", margin: 0 }}>
                Generate a standardized JSON backup of your current database state.
              </p>
            </div>
          </div>

          <div
            style={{
              background: "var(--bg-base)",
              padding: "14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              fontSize: "12px"
            }}
          >
            <div><strong>Projects:</strong> {counts.projects ?? "-"}</div>
            <div><strong>Experience:</strong> {counts.experience ?? "-"}</div>
            <div><strong>Education:</strong> {counts.education ?? "-"}</div>
            <div><strong>Skills:</strong> {counts.skills ?? "-"}</div>
            <div><strong>Certifications:</strong> {counts.certifications ?? "-"}</div>
            <div><strong>Achievements:</strong> {counts.achievements ?? "-"}</div>
            <div><strong>Gallery:</strong> {counts.gallery ?? "-"}</div>
            <div><strong>Media Catalog:</strong> {counts.media ?? "-"}</div>
            <div><strong>Profile:</strong> Active</div>
            <div><strong>Site Settings:</strong> Active</div>
          </div>

          <Button onClick={handleExport} variant="primary" disabled={loading} style={{ marginTop: "auto" }}>
            📥 Download Backup JSON
          </Button>
        </div>

        {/* Import Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>🔄</span>
            <div>
              <h2 style={{ fontSize: "16px", color: "var(--text-bright)", margin: 0 }}>Restore from Backup</h2>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", margin: 0 }}>
                Upload a JSON archive to restore or migrate your content.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "24px 16px",
              border: "2px dashed var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              textAlign: "center",
              background: "var(--bg-base)"
            }}
          >
            <input
              type="file"
              id="backupFileInput"
              accept=".json,application/json"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <label
              htmlFor="backupFileInput"
              className="btn btn-outline btn-sm"
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span>📂 Select JSON Backup File</span>
            </label>
            <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "10px", margin: 0 }}>
              File must be a valid <code>portfolio-backup-*.json</code> archive.
            </p>
          </div>

          <div style={{ fontSize: "11.5px", color: "var(--text-dim)", lineHeight: 1.5, marginTop: "auto" }}>
            <span style={{ color: "var(--accent-amber)", fontWeight: 600 }}>Safety Guard:</span> Uploading a backup
            will open a pre-import inspection dialog where you can review entity counts before writing to Supabase.
          </div>
        </div>
      </div>

      {/* Pre-Import Confirmation Modal */}
      {importModalOpen && importData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "540px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid var(--border-strong)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <h3 style={{ fontSize: "16px", color: "var(--text-bright)", margin: 0 }}>
                  Pre-Import Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "16px", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px" }}>
              Review the backup contents found in <strong>{importFile?.name}</strong> before applying them to your database.
            </p>

            {importData.metadata && (
              <div
                style={{
                  background: "var(--bg-base)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "11.5px",
                  color: "var(--text-dim)",
                  marginBottom: "16px"
                }}
              >
                <div><strong>Export Date:</strong> {new Date(importData.metadata.exportDate).toLocaleString()}</div>
                <div><strong>Archive Version:</strong> {importData.metadata.version || "1.0"}</div>
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label className="admin-label">INCOMING ENTITY COUNTS:</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                  fontSize: "12px",
                  background: "var(--bg-base)",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div>Projects: <strong>{incomingCollections.projects?.length || 0}</strong></div>
                <div>Experience: <strong>{incomingCollections.experience?.length || 0}</strong></div>
                <div>Education: <strong>{incomingCollections.education?.length || 0}</strong></div>
                <div>Skills: <strong>{incomingCollections.skills?.length || 0}</strong></div>
                <div>Certifications: <strong>{incomingCollections.certifications?.length || 0}</strong></div>
                <div>Achievements: <strong>{incomingCollections.achievements?.length || 0}</strong></div>
                <div>Gallery: <strong>{incomingCollections.gallery?.length || 0}</strong></div>
                <div>Profile: <strong>{incomingCollections.profile ? "Yes" : "No"}</strong></div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="admin-label">IMPORT STRATEGY:</label>
              <div style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === "merge"}
                    onChange={(e) => setImportMode(e.target.value)}
                  />
                  <span>Merge &amp; Upsert (Recommended)</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Button onClick={() => setImportModalOpen(false)} variant="outline" size="sm" disabled={isImporting}>
                Cancel
              </Button>
              <Button onClick={executeImport} variant="primary" size="sm" disabled={isImporting}>
                {isImporting ? "Applying Import..." : "Confirm & Restore"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
