import React, { useState, useEffect } from "react";
import { fetchContentVersions, fetchAllProjectsAdmin } from "../../services/supabaseService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminVersionsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    async function loadEntities() {
      if (isSupabaseConfigured()) {
        const projs = await fetchAllProjectsAdmin();
        if (projs && projs.length > 0) {
          setProjects(projs);
          setSelectedEntityId(projs[0].id);
        }
      }
    }
    loadEntities();
  }, []);

  useEffect(() => {
    async function loadVersions() {
      if (!selectedEntityId || !isSupabaseConfigured()) return;
      setLoading(true);
      const data = await fetchContentVersions("project", selectedEntityId);
      setVersions(data);
      setSelectedVersion(data[0] || null);
      setLoading(false);
    }
    loadVersions();
  }, [selectedEntityId]);

  return (
    <div className="admin-page">
      <SEO title="Version History — Admin CMS" description="Inspect historical content versions." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">IMMUTABLE SNAPSHOTS</span>
          <h1 className="admin-page-title">Content Version History</h1>
          <p className="admin-page-desc">
            Review historical snapshots and previous revisions for portfolio case studies and platform content.
          </p>
        </div>
      </div>

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
          ⚠️ Supabase is not configured yet. Version history is persisted to <code>content_versions</code> table in Supabase.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {/* Entity Selector */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <label className="admin-label" style={{ margin: 0 }}>SELECT PROJECT TO INSPECT:</label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="admin-input"
              style={{ maxWidth: "320px" }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.slug})
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Loading version history snapshots...
            </div>
          ) : versions.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                No version history recorded yet for this item. Versions are created automatically on every save.
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

              {/* Version JSON Inspector */}
              <div className="card">
                <h3 style={{ fontSize: "14px", color: "var(--text-bright)", margin: "0 0 8px" }}>
                  Revision #{selectedVersion?.version_number} Data Payload
                </h3>
                {selectedVersion && (
                  <pre
                    style={{
                      background: "var(--bg-base)",
                      padding: "14px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--accent-cyan)",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)",
                      maxHeight: "400px",
                      overflow: "auto"
                    }}
                  >
                    {JSON.stringify(selectedVersion.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

