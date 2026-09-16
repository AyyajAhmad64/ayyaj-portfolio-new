import React, { useState, useEffect } from "react";
import { getCertifications, saveCertification, deleteCertification, reorderCertifications } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminCertificationsPage() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [issuerFilter, setIssuerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [copiedId, setCopiedId] = useState("");

  const loadData = async () => {
    const data = await getCertifications();
    setList(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item) => {
    setEditing({
      ...item,
      skillsStr: item.skills ? item.skills.join(", ") : ""
    });
  };

  const handleCreate = () => {
    setEditing({
      name: "",
      issuer: "",
      date: "",
      status: "Completed",
      credentialId: "",
      verificationUrl: "",
      description: "",
      skillsStr: ""
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;

    try {
      setIsSaving(true);
      setErrorNotice("");

      const payload = {
        ...editing,
        skills: editing.skillsStr ? editing.skillsStr.split(",").map((s) => s.trim()).filter(Boolean) : []
      };
      delete payload.skillsStr;

      await saveCertification(payload);
      await loadData();
      setEditing(null);
      setNotice("Certification credential saved to Supabase.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to save certification:", err);
      setErrorNotice(err.message || "Cloud save failed. Your changes were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete certificate "${name}"?`)) {
      try {
        setErrorNotice("");
        await deleteCertification(id);
        await loadData();
        setNotice("Credential deleted from Supabase.");
        setTimeout(() => setNotice(""), 3000);
      } catch (err) {
        console.error("Failed to delete certification:", err);
        setErrorNotice(err.message || "Cloud deletion failed. Credential was not deleted.");
      }
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const reordered = [...list];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setList(reordered);
    try {
      await reorderCertifications(reordered.map((c) => c.id));
    } catch (err) {
      console.warn("Reorder failed in cloud:", err);
    }
  };

  const handleCopy = (credId) => {
    if (!credId) return;
    navigator.clipboard.writeText(credId);
    setCopiedId(credId);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const issuers = ["All", ...Array.from(new Set(list.map((c) => c.issuer).filter(Boolean)))];

  const filtered = list.filter((item) => {
    if (issuerFilter !== "All" && item.issuer !== issuerFilter) return false;
    const itemStatus = item.status || "Completed";
    if (statusFilter !== "All" && itemStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.issuer && item.issuer.toLowerCase().includes(q)) ||
      (item.credentialId && item.credentialId.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (Array.isArray(item.skills) && item.skills.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="admin-page">
      <SEO title="Manage Certifications — Admin CMS" description="Manage verified certifications and training licenses." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">CREDENTIALS REGISTRY</span>
          <h1 className="admin-page-title">Certifications &amp; Licenses</h1>
          <p className="admin-page-desc">
            Manage verified industry training certifications, issuers, and verification credentials.
          </p>
        </div>

        <Button onClick={handleCreate} variant="primary" size="sm">
          + Add Certification
        </Button>
      </div>

      {errorNotice && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-sm)",
            color: "#fca5a5",
            fontSize: "13px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span>⚠️ <strong>Cloud operation failed:</strong> {errorNotice}</span>
          <button
            type="button"
            onClick={() => setErrorNotice("")}
            style={{ background: "transparent", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: "14px" }}
            aria-label="Dismiss error notice"
          >
            ✕
          </button>
        </div>
      )}

      {notice && (
        <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid var(--accent-emerald)", borderRadius: "var(--radius-sm)", color: "var(--accent-emerald)", fontSize: "13px", marginBottom: "20px" }}>
          {notice}
        </div>
      )}

      {/* Compact Responsive Filter Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-grid-3">
          <div className="admin-filter-field">
            <label className="admin-label">SEARCH CREDENTIALS</label>
            <input
              type="text"
              className="admin-input"
              placeholder="Search by name, issuer, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filter-field">
            <label className="admin-label">ISSUER</label>
            <select
              className="admin-input"
              value={issuerFilter}
              onChange={(e) => setIssuerFilter(e.target.value)}
            >
              {issuers.map((iss) => (
                <option key={iss} value={iss}>{iss}</option>
              ))}
            </select>
          </div>

          <div className="admin-filter-field">
            <label className="admin-label">STATUS</label>
            <select
              className="admin-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          {(searchQuery || issuerFilter !== "All" || statusFilter !== "All") ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIssuerFilter("All");
                setStatusFilter("All");
              }}
              className="btn btn-ghost btn-sm admin-filter-reset-btn"
            >
              Reset Filters
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {editing && (
        <div className="card" style={{ marginBottom: "32px", border: "2px solid var(--accent-cyan)" }}>
          <div className="section-row-header">
            <h2 className="section-title-sm">Edit Certification: {editing.name || "New Credential"}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">CREDENTIAL / COURSE TITLE</label>
                <input
                  type="text"
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="admin-input"
                  placeholder="Mastering Azure DevOps..."
                />
              </div>

              <div>
                <label className="admin-label">ISSUING ORGANIZATION</label>
                <input
                  type="text"
                  required
                  value={editing.issuer}
                  onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                  className="admin-input"
                  placeholder="Microsoft, Coursera, Udemy..."
                />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">DATE / YEAR</label>
                <input
                  type="text"
                  required
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. 2026 or Sep 2026"
                />
              </div>

              <div>
                <label className="admin-label">STATUS</label>
                <select
                  value={editing.status || "Completed"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="admin-input"
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">CREDENTIAL ID (OPTIONAL)</label>
                <input
                  type="text"
                  value={editing.credentialId || ""}
                  onChange={(e) => setEditing({ ...editing, credentialId: e.target.value })}
                  className="admin-input"
                  placeholder="Leave empty if not applicable"
                />
              </div>

              <div>
                <label className="admin-label">VERIFICATION LINK (OPTIONAL)</label>
                <input
                  type="url"
                  value={editing.verificationUrl || ""}
                  onChange={(e) => setEditing({ ...editing, verificationUrl: e.target.value })}
                  className="admin-input"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="admin-label">DESCRIPTION</label>
              <textarea
                rows={2}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div>
              <label className="admin-label">SKILLS COVERED (COMMA-SEPARATED)</label>
              <input
                type="text"
                value={editing.skillsStr}
                onChange={(e) => setEditing({ ...editing, skillsStr: e.target.value })}
                className="admin-input"
                placeholder="React.js, Node.js, MongoDB, REST Architecture"
              />
            </div>

            <div className="admin-form-actions">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Certification"}
              </Button>
              <Button onClick={() => setEditing(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Cards List */}
      <div style={{ display: "grid", gap: "16px" }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
            No credentials found matching &quot;{searchQuery || issuerFilter}&quot;.
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div key={item.id} className="card">
              <div className="admin-cert-card-inner">
                {/* Reorder Column */}
                <div className="admin-cert-order-col">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "4px 8px", fontSize: "11px", lineHeight: 1 }}
                    title="Move Up"
                    aria-label={`Move credential #${idx + 1} up`}
                  >
                    ▲
                  </button>
                  <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === filtered.length - 1}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "4px 8px", fontSize: "11px", lineHeight: 1 }}
                    title="Move Down"
                    aria-label={`Move credential #${idx + 1} down`}
                  >
                    ▼
                  </button>
                </div>

                {/* Thumbnail / Media Column */}
                <div
                  style={{
                    width: "68px",
                    height: "52px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title={item.name}
                >
                  {item.image || (item.certificateUrl && /\.(png|jpe?g|webp|gif|svg)$/i.test(item.certificateUrl)) ? (
                    <img
                      src={item.image || item.certificateUrl}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: "20px", lineHeight: 1 }}>📜</span>
                  )}
                </div>

                {/* Content Column */}
                <div className="admin-cert-content-col">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "15px", color: "var(--text-bright)", margin: 0 }}>{item.name}</h3>
                    <span
                      style={{
                        fontSize: "10.5px",
                        fontWeight: "700",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        background: (item.status || "Completed").toLowerCase().includes("progress") ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        color: (item.status || "Completed").toLowerCase().includes("progress") ? "var(--accent-amber)" : "var(--accent-emerald)",
                        fontFamily: "var(--font-mono)"
                      }}
                    >
                      {item.status || "Completed"}
                    </span>
                  </div>

                  <div style={{ color: "var(--accent-amber)", fontSize: "12.5px", marginBottom: "4px" }}>
                    {item.issuer} · {item.date}
                  </div>

                  {item.description && (
                    <p style={{ color: "var(--text-muted)", fontSize: "12.5px", margin: "4px 0 6px", maxWidth: "68ch", lineHeight: "1.5" }}>
                      {item.description}
                    </p>
                  )}

                  {item.skills && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                      {item.skills.map((s) => (
                        <span key={s} className="micro-tag">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Safe Wrapping Credential ID */}
                  {item.credentialId && (
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10.5px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        CREDENTIAL ID:
                      </span>
                      <code
                        style={{
                          fontSize: "11px",
                          color: "var(--accent-cyan)",
                          background: "var(--bg-base)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-subtle)",
                          wordBreak: "break-all",
                          maxWidth: "100%"
                        }}
                      >
                        {item.credentialId}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.credentialId)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: "11px", padding: "2px 8px", height: "auto", minHeight: "unset" }}
                        title="Copy Credential ID"
                        aria-label="Copy Credential ID"
                      >
                        {copiedId === item.credentialId ? "Copied ✓" : "Copy 📋"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions Column */}
                <div className="admin-cert-actions-col">
                  <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                    Edit ✎
                  </Button>
                  {item.verificationUrl && (
                    <a
                      href={item.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                    >
                      Verify ↗
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "#f87171" }}
                  >
                    Delete ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
