import React, { useState, useEffect } from "react";
import {
  fetchContentVersions,
  fetchAllProjectsAdmin,
  recordAuditLog
} from "../../services/supabaseService";
import {
  saveProject,
  getCertifications,
  saveCertification,
  getAchievements,
  saveAchievement,
  getGallery,
  saveGalleryItem,
  getProfile,
  updateProfile
} from "../../services/dataService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminVersionsPage() {
  const { refresh } = usePortfolioData();
  const [entityType, setEntityType] = useState("project");
  const [entities, setEntities] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Restore Modal State
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  // Load list of entities whenever entityType changes
  useEffect(() => {
    async function loadEntityList() {
      if (!isSupabaseConfigured()) return;
      try {
        let items = [];
        if (entityType === "project") {
          const projs = await fetchAllProjectsAdmin();
          items = (projs || []).map((p) => ({ id: p.id, label: `${p.title} (${p.slug})` }));
        } else if (entityType === "certification") {
          const certs = await getCertifications();
          items = (certs || []).map((c) => ({ id: c.id, label: c.name }));
        } else if (entityType === "achievement") {
          const ach = await getAchievements();
          items = (ach || []).map((a) => ({ id: a.id, label: a.title }));
        } else if (entityType === "gallery") {
          const gal = await getGallery();
          items = (gal || []).map((g) => ({ id: g.id, label: g.title }));
        } else if (entityType === "profile") {
          const prof = await getProfile();
          items = [{ id: prof?.id || "default_profile", label: "Global Profile Data" }];
        }

        setEntities(items);
        if (items.length > 0) {
          setSelectedEntityId(items[0].id);
        } else {
          setSelectedEntityId("");
          setVersions([]);
          setSelectedVersion(null);
        }
      } catch (err) {
        console.error("Failed to load entities:", err);
      }
    }
    loadEntityList();
  }, [entityType]);

  // Load versions whenever selectedEntityId changes
  useEffect(() => {
    async function loadVersions() {
      if (!selectedEntityId || !isSupabaseConfigured()) {
        setVersions([]);
        setSelectedVersion(null);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchContentVersions(entityType, selectedEntityId);
        setVersions(data || []);
        setSelectedVersion(data?.[0] || null);
      } catch (err) {
        console.error("Failed to load versions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVersions();
  }, [selectedEntityId, entityType]);

  const handleExecuteRestore = async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);
    setErrorNotice("");
    setNotice("");

    try {
      const payload = restoreTarget.data;
      if (entityType === "project") {
        await saveProject(payload);
      } else if (entityType === "certification") {
        await saveCertification(payload);
      } else if (entityType === "achievement") {
        await saveAchievement(payload);
      } else if (entityType === "gallery") {
        await saveGalleryItem(payload);
      } else if (entityType === "profile") {
        await updateProfile(payload);
      }

      await recordAuditLog("RESTORE_VERSION", entityType, selectedEntityId, {
        versionNumber: restoreTarget.version_number,
        timestamp: restoreTarget.created_at
      });

      if (refresh) await refresh();

      setNotice(`✓ Successfully restored Revision #${restoreTarget.version_number} to Supabase!`);
      setRestoreTarget(null);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      console.error("Restore failed:", err);
      setErrorNotice(err.message || "Cloud restore failed.");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Version History & Restore — Admin CMS" description="Inspect and restore historical content versions." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">IMMUTABLE SNAPSHOTS</span>
          <h1 className="admin-page-title">Content Version History &amp; Restore</h1>
          <p className="admin-page-desc">
            Review historical snapshots and safely roll back changes for case studies, credentials, milestones, and media.
          </p>
        </div>
      </div>

      {notice && (
        <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid var(--accent-emerald)", borderRadius: "var(--radius-sm)", color: "var(--accent-emerald)", fontSize: "13px", marginBottom: "20px" }}>
          {notice}
        </div>
      )}

      {errorNotice && (
        <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid var(--accent-rose)", borderRadius: "var(--radius-sm)", color: "var(--accent-rose)", fontSize: "13px", marginBottom: "20px" }}>
          {errorNotice}
        </div>
      )}

      {!isSupabaseConfigured() ? (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-amber)",
            fontSize: "13px",
            marginBottom: "24px"
          }}
        >
          ⚠️ Supabase is not configured yet. Version history snapshots require an active Supabase Cloud connection.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {/* Entity Controls */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <label className="admin-label">COLLECTION:</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="admin-input"
                style={{ width: "160px" }}
              >
                <option value="project">Projects</option>
                <option value="certification">Certifications</option>
                <option value="achievement">Achievements</option>
                <option value="gallery">Gallery</option>
                <option value="profile">Profile</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: "240px" }}>
              <label className="admin-label">SELECT ITEM TO INSPECT:</label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="admin-input"
                disabled={entities.length === 0}
              >
                {entities.length === 0 ? (
                  <option value="">No records found</option>
                ) : (
                  entities.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Loading version history snapshots...
            </div>
          ) : versions.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                No version history recorded yet for this item. Versions are created automatically whenever items are saved.
              </p>
            </div>
          ) : (
            <div className="admin-versions-grid">
              {/* Version List */}
              <div className="card" style={{ display: "grid", gap: "10px" }}>
                <h3 style={{ fontSize: "14px", color: "var(--text-bright)", margin: "0 0 8px" }}>
                  Available Revisions ({versions.length})
                </h3>
                {versions.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVersion(v)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      background: selectedVersion?.id === v.id ? "rgba(56, 189, 248, 0.15)" : "var(--bg-base)",
                      border: selectedVersion?.id === v.id ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-bright)" }}>
                        Revision #{v.version_number}
                      </span>
                      <p style={{ fontSize: "11px", color: "var(--text-dim)", margin: "2px 0 0" }}>
                        Saved by {v.changed_by || "admin"}
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                      {new Date(v.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Version JSON Inspector & Restore Action */}
              <div className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <h3 style={{ fontSize: "14px", color: "var(--text-bright)", margin: 0 }}>
                    Revision #{selectedVersion?.version_number} Snapshot Details
                  </h3>

                  {selectedVersion && (
                    <Button
                      onClick={() => setRestoreTarget(selectedVersion)}
                      variant="primary"
                      size="sm"
                    >
                      ↩ Restore This Revision
                    </Button>
                  )}
                </div>

                {selectedVersion && (
                  <div style={{ display: "grid", gap: "8px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                      Timestamp: {new Date(selectedVersion.created_at).toLocaleString()} · Author: {selectedVersion.changed_by || "admin"}
                    </div>
                    <pre
                      style={{
                        background: "var(--bg-base)",
                        padding: "14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--accent-cyan)",
                        fontSize: "12px",
                        fontFamily: "var(--font-mono)",
                        maxHeight: "420px",
                        overflow: "auto"
                      }}
                    >
                      {JSON.stringify(selectedVersion.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreTarget && (
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
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid var(--border-strong)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <h3 style={{ fontSize: "16px", color: "var(--text-bright)", margin: 0 }}>
                  Confirm Revision Rollback
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRestoreTarget(null)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "16px", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px", lineHeight: 1.5 }}>
              You are about to restore <strong>Revision #{restoreTarget.version_number}</strong> (saved on{" "}
              {new Date(restoreTarget.created_at).toLocaleString()}). This will overwrite the current live
              database state for this item in Supabase.
            </p>

            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                color: "var(--accent-amber)",
                marginBottom: "20px"
              }}
            >
              An audit log event and a new incremental version snapshot will be logged immediately.
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Button onClick={() => setRestoreTarget(null)} variant="outline" size="sm" disabled={isRestoring}>
                Cancel
              </Button>
              <Button onClick={handleExecuteRestore} variant="primary" size="sm" disabled={isRestoring}>
                {isRestoring ? "Restoring..." : "Yes, Restore Revision"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
