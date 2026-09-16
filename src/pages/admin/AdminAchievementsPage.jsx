import React, { useState, useEffect } from "react";
import { getAchievements, saveAchievement, deleteAchievement } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminAchievementsPage() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    const data = await getAchievements();
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
      title: "",
      slug: "",
      type: "Academic Milestone",
      organization: "",
      date: "2026",
      description: "",
      impact: "",
      highlightsStr: "Milestone detail one\nMilestone detail two"
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

      await saveAchievement(payload);
      await loadData();
      setEditing(null);
      setNotice("Achievement saved to Supabase.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to save achievement:", err);
      setErrorNotice(err.message || "Cloud save failed. Your changes were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete achievement "${title}"?`)) {
      try {
        setErrorNotice("");
        await deleteAchievement(id);
        await loadData();
        setNotice("Achievement deleted from Supabase.");
        setTimeout(() => setNotice(""), 3000);
      } catch (err) {
        console.error("Failed to delete achievement:", err);
        setErrorNotice(err.message || "Cloud deletion failed. Record was not deleted.");
      }
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Manage Achievements — Admin CMS" description="Manage verified achievements and milestones." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">HONORS &amp; MILESTONES</span>
          <h1 className="admin-page-title">Achievements Registry</h1>
          <p className="admin-page-desc">
            Manage academic milestones, competitive internship selections, and educational distinctions.
          </p>
        </div>

        <Button onClick={handleCreate} variant="primary" size="sm">
          + Add Milestone
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
            <h2 className="section-title-sm">Edit Milestone: {editing.title || "New Milestone"}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">MILESTONE TITLE</label>
                <input
                  type="text"
                  required
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">TYPE / CLASSIFICATION</label>
                <input
                  type="text"
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  className="admin-input"
                  placeholder="Academic Milestone, Industry Selection"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">ORGANIZATION / INSTITUTION</label>
                <input
                  type="text"
                  required
                  value={editing.organization}
                  onChange={(e) => setEditing({ ...editing, organization: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">DATE / YEAR</label>
                <input
                  type="text"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">DESCRIPTION</label>
              <textarea
                rows={2}
                required
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div>
              <label className="admin-label">IMPACT / SIGNIFICANCE</label>
              <textarea
                rows={2}
                value={editing.impact || ""}
                onChange={(e) => setEditing({ ...editing, impact: e.target.value })}
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

            <div style={{ display: "flex", gap: "10px" }}>
              <Button type="submit" variant="primary">
                Save Milestone
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
          <div key={item.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <span className="achievement-micro-tag">{item.type}</span>
                <h3 style={{ fontSize: "16px", color: "var(--text-bright)", margin: "4px 0" }}>{item.title}</h3>
                <div style={{ color: "var(--accent-amber)", fontSize: "13px" }}>
                  {item.organization} · {item.date}
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px", maxWidth: "68ch" }}>
                  {item.description}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                  Edit ✎
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="btn btn-ghost btn-sm"
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

