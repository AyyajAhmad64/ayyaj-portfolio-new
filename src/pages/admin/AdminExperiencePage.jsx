import React, { useState, useEffect } from "react";
import { getExperience, saveExperience, deleteExperience } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminExperiencePage() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    const data = await getExperience();
    setList(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item) => {
    setEditing({
      ...item,
      techStr: item.technologies ? item.technologies.join(", ") : ""
    });
  };

  const handleCreate = () => {
    setEditing({
      role: "",
      company: "",
      employmentType: "Internship",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      techStr: ""
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
        technologies: editing.techStr.split(",").map((s) => s.trim()).filter(Boolean)
      };
      delete payload.techStr;

      await saveExperience(payload);
      await loadData();
      setEditing(null);
      setNotice("Experience item saved to Supabase.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to save experience:", err);
      setErrorNotice(err.message || "Cloud save failed. Your changes were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, role) => {
    if (window.confirm(`Delete experience item "${role}"?`)) {
      try {
        setErrorNotice("");
        await deleteExperience(id);
        await loadData();
        setNotice("Experience item deleted from Supabase.");
        setTimeout(() => setNotice(""), 3000);
      } catch (err) {
        console.error("Failed to delete experience:", err);
        setErrorNotice(err.message || "Cloud deletion failed. Item was not deleted.");
      }
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Manage Experience — Admin CMS" description="Manage career experience history." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">WORK HISTORY</span>
          <h1 className="admin-page-title">Experience Timeline Management</h1>
          <p className="admin-page-desc">
            Maintain chronological employment records, internships, roles, and technology tags.
          </p>
        </div>

        <Button onClick={handleCreate} variant="primary" size="sm">
          + Add Role / Internship
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

      {editing && (
        <div className="card" style={{ marginBottom: "32px", border: "2px solid var(--accent-cyan)" }}>
          <div className="section-row-header">
            <h2 className="section-title-sm">Edit Role: {editing.role || "New Role"}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">JOB TITLE / ROLE</label>
                <input
                  type="text"
                  required
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">COMPANY / ORGANIZATION</label>
                <input
                  type="text"
                  required
                  value={editing.company}
                  onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">EMPLOYMENT TYPE</label>
                <input
                  type="text"
                  value={editing.employmentType}
                  onChange={(e) => setEditing({ ...editing, employmentType: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Internship, Full-time"
                />
              </div>

              <div>
                <label className="admin-label">LOCATION</label>
                <input
                  type="text"
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Remote, Pune"
                />
              </div>

              <div>
                <label className="admin-label">START DATE – END DATE</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={editing.startDate}
                    onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                    className="admin-input"
                    style={{ minWidth: 0 }}
                    placeholder="Sep 2026"
                  />
                  <input
                    type="text"
                    value={editing.endDate}
                    onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                    className="admin-input"
                    style={{ minWidth: 0 }}
                    placeholder="Present"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="isCurrent"
                checked={Boolean(editing.current)}
                onChange={(e) => setEditing({ ...editing, current: e.target.checked })}
              />
              <label htmlFor="isCurrent" style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-emerald)" }}>
                Mark as Current Active Role
              </label>
            </div>

            <div>
              <label className="admin-label">ROLE DESCRIPTION &amp; RESPONSIBILITIES</label>
              <textarea
                rows={3}
                required
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div>
              <label className="admin-label">TECHNOLOGIES USED (COMMA-SEPARATED)</label>
              <input
                type="text"
                value={editing.techStr}
                onChange={(e) => setEditing({ ...editing, techStr: e.target.value })}
                className="admin-input"
                placeholder="React.js, Node.js, MongoDB, REST APIs"
              />
            </div>

            <div className="admin-form-actions">
              <Button type="submit" variant="primary">
                Save Experience
              </Button>
              <Button onClick={() => setEditing(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {list.map((item) => (
          <div key={item.id} className="card admin-experience-card admin-card">
            <div className="admin-experience-card-inner">
              <div className="admin-experience-content">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-bright)", margin: 0, wordBreak: "break-word" }}>{item.role}</h3>
                  {item.current && (
                    <span className="admin-status-pill current-pill" style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px", background: "var(--accent-cyan-soft)", color: "var(--accent-cyan)", fontWeight: "700", border: "1px solid var(--accent-cyan)", whiteSpace: "nowrap" }}>
                      CURRENT ROLE
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--accent-cyan)", fontSize: "13px", fontWeight: "600", marginTop: "2px" }}>
                  {item.company} · {item.employmentType}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                  {item.startDate} – {item.endDate} · {item.location}
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px", maxWidth: "68ch", lineHeight: "1.5", wordBreak: "break-word" }}>
                  {item.description}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                  {(item.technologies || []).map((t) => (
                    <span key={t} className="micro-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="admin-card-actions">
                <Button onClick={() => handleEdit(item)} variant="outline" size="sm" className="admin-action-btn">
                  Edit ✎
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.role)}
                  className="btn btn-ghost btn-sm admin-action-btn admin-delete-btn"
                  style={{ color: "#f87171" }}
                >
                  Delete ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

