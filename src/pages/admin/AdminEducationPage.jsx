import React, { useState, useEffect } from "react";
import { getEducation, saveEducation, deleteEducation } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminEducationPage() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    const data = await getEducation();
    setList(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item) => {
    setEditing({
      ...item,
      highlightsStr: item.highlights ? item.highlights.join("\n") : ""
    });
  };

  const handleCreate = () => {
    setEditing({
      degree: "",
      specialization: "",
      institution: "",
      location: "",
      year: "",
      status: "In Progress",
      current: false,
      description: "",
      highlightsStr: ""
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
        highlights: editing.highlightsStr.split("\n").map((s) => s.trim()).filter(Boolean)
      };
      delete payload.highlightsStr;

      await saveEducation(payload);
      await loadData();
      setEditing(null);
      setNotice("Education record saved to Supabase.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to save education:", err);
      setErrorNotice(err.message || "Cloud save failed. Your changes were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, degree) => {
    if (window.confirm(`Delete qualification "${degree}"?`)) {
      try {
        setErrorNotice("");
        await deleteEducation(id);
        await loadData();
        setNotice("Qualification deleted from Supabase.");
        setTimeout(() => setNotice(""), 3000);
      } catch (err) {
        console.error("Failed to delete education:", err);
        setErrorNotice(err.message || "Cloud deletion failed. Record was not deleted.");
      }
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Manage Education — Admin CMS" description="Manage formal degrees and educational qualifications." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">ACADEMIC CREDENTIALS</span>
          <h1 className="admin-page-title">Education Qualifications</h1>
          <p className="admin-page-desc">
            Manage academic degrees, university credentials, coursework highlights, and current study statuses.
          </p>
        </div>

        <Button onClick={handleCreate} variant="primary" size="sm">
          + Add Academic Degree
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
            <h2 className="section-title-sm">Edit Degree: {editing.degree || "New Degree"}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">DEGREE TITLE</label>
                <input
                  type="text"
                  required
                  value={editing.degree}
                  onChange={(e) => setEditing({ ...editing, degree: e.target.value })}
                  className="admin-input"
                  placeholder="Master of Computer Applications (MCA)"
                />
              </div>

              <div>
                <label className="admin-label">FIELD / SPECIALIZATION</label>
                <input
                  type="text"
                  value={editing.specialization}
                  onChange={(e) => setEditing({ ...editing, specialization: e.target.value })}
                  className="admin-input"
                  placeholder="Cloud Computing"
                />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">INSTITUTION / UNIVERSITY</label>
                <input
                  type="text"
                  required
                  value={editing.institution}
                  onChange={(e) => setEditing({ ...editing, institution: e.target.value })}
                  className="admin-input"
                  placeholder="Dr. D. Y. Patil Institute of Management..."
                />
              </div>

              <div>
                <label className="admin-label">LOCATION &amp; YEAR</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={editing.location}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                    className="admin-input"
                    style={{ minWidth: 0 }}
                    placeholder="Pune, Maharashtra, India"
                  />
                  <input
                    type="text"
                    value={editing.year}
                    onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                    className="admin-input"
                    style={{ minWidth: 0 }}
                    placeholder="Expected 2027"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="isCurrentEdu"
                checked={Boolean(editing.current)}
                onChange={(e) => setEditing({ ...editing, current: e.target.checked })}
              />
              <label htmlFor="isCurrentEdu" style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-cyan)" }}>
                Mark as Current Active Studies
              </label>
            </div>

            <div>
              <label className="admin-label">DESCRIPTION</label>
              <textarea
                rows={3}
                required
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div>
              <label className="admin-label">HIGHLIGHTS (ONE PER LINE)</label>
              <textarea
                rows={3}
                value={editing.highlightsStr}
                onChange={(e) => setEditing({ ...editing, highlightsStr: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div className="admin-form-actions">
              <Button type="submit" variant="primary">
                Save Degree
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
          <div key={item.id} className="card admin-education-card admin-card">
            <div className="admin-education-card-inner">
              <div className="admin-education-content">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-bright)", margin: 0, wordBreak: "break-word" }}>{item.degree}</h3>
                  {item.current && (
                    <span className="admin-status-pill current-pill" style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px", background: "var(--accent-cyan-soft)", color: "var(--accent-cyan)", fontWeight: "700", border: "1px solid var(--accent-cyan)", whiteSpace: "nowrap" }}>
                      CURRENT STUDIES
                    </span>
                  )}
                </div>
                {item.specialization && (
                  <div style={{ color: "var(--accent-cyan)", fontSize: "13px", fontWeight: "600", marginTop: "2px" }}>
                    Specialization: {item.specialization}
                  </div>
                )}
                <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {item.institution} · {item.location} ({item.year})
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px", maxWidth: "68ch", lineHeight: "1.5", wordBreak: "break-word" }}>
                  {item.description}
                </p>
              </div>

              <div className="admin-card-actions">
                <Button onClick={() => handleEdit(item)} variant="outline" size="sm" className="admin-action-btn">
                  Edit ✎
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.degree)}
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

