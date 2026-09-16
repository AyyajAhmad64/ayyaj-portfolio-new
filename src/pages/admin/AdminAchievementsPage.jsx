import React, { useState, useEffect } from "react";
import { getAchievements, saveAchievement, deleteAchievement, reorderAchievements } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminAchievementsPage() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const loadData = async () => {
    const data = await getAchievements();
    setList(data || []);
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
      date: "",
      description: "",
      impact: "",
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
        highlights: editing.highlightsStr ? editing.highlightsStr.split("\n").map((s) => s.trim()).filter(Boolean) : []
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

  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setList(updated);

    try {
      const orderedIds = updated.map((item) => item.id);
      await reorderAchievements(orderedIds);
      setNotice("Milestone order updated in Supabase.");
      setTimeout(() => setNotice(""), 2000);
    } catch (err) {
      console.error("Failed to reorder achievements:", err);
      setErrorNotice("Failed to save reordered milestones to Supabase.");
      loadData();
    }
  };

  const achievementTypes = ["All", ...Array.from(new Set(list.map((a) => a.type).filter(Boolean)))];

  const filtered = list.filter((item) => {
    if (typeFilter !== "All" && item.type !== typeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.organization && item.organization.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.impact && item.impact.toLowerCase().includes(q)) ||
      (Array.isArray(item.highlights) && item.highlights.some((h) => h.toLowerCase().includes(q)))
    );
  });

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

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: "20px", padding: "14px 16px" }}>
        <div className="admin-filter-bar admin-filter-grid-3">
          <div className="admin-filter-field">
            <label className="admin-label">SEARCH MILESTONES</label>
            <input
              type="text"
              placeholder="Search by title, organization, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-filter-field">
            <label className="admin-label">TYPE / CLASSIFICATION</label>
            <select
              className="admin-input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {achievementTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {(searchQuery || typeFilter !== "All") ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("All");
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
            <h2 className="section-title-sm">Edit Milestone: {editing.title || "New Milestone"}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">MILESTONE TITLE</label>
                <input
                  type="text"
                  required
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. CodeAlpha Full Stack Development Internship"
                />
              </div>

              <div>
                <label className="admin-label">TYPE / CLASSIFICATION</label>
                <input
                  type="text"
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Academic Milestone, Industry Selection"
                />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">ORGANIZATION / INSTITUTION</label>
                <input
                  type="text"
                  required
                  value={editing.organization}
                  onChange={(e) => setEditing({ ...editing, organization: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. CodeAlpha, College of Engineering"
                />
              </div>

              <div>
                <label className="admin-label">DATE / YEAR</label>
                <input
                  type="text"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. 2026 or Nov 2026"
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
                placeholder="Brief summary of the honor or milestone..."
              />
            </div>

            <div>
              <label className="admin-label">IMPACT / SIGNIFICANCE</label>
              <textarea
                rows={2}
                value={editing.impact || ""}
                onChange={(e) => setEditing({ ...editing, impact: e.target.value })}
                className="admin-textarea"
                placeholder="Measurable impact or key takeaways..."
              />
            </div>

            <div>
              <label className="admin-label">HIGHLIGHTS (ONE PER LINE)</label>
              <textarea
                rows={3}
                value={editing.highlightsStr}
                onChange={(e) => setEditing({ ...editing, highlightsStr: e.target.value })}
                className="admin-textarea"
                placeholder="Key achievement detail 1&#10;Key achievement detail 2"
              />
            </div>

            <div className="admin-form-actions">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Milestone"}
              </Button>
              <Button onClick={() => setEditing(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List of Milestones */}
      <div style={{ display: "grid", gap: "16px" }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
            No milestones found matching the filter criteria.
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div key={item.id || idx} className="card">
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
                    aria-label={`Move milestone #${idx + 1} up`}
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
                    aria-label={`Move milestone #${idx + 1} down`}
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
                  title={item.title}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: "20px", lineHeight: 1 }}>🏆</span>
                  )}
                </div>

                {/* Content Column */}
                <div className="admin-cert-content-col">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span className="achievement-micro-tag">{item.type}</span>
                    <h3 style={{ fontSize: "15px", color: "var(--text-bright)", margin: 0 }}>{item.title}</h3>
                  </div>

                  <div style={{ color: "var(--accent-amber)", fontSize: "12.5px", marginBottom: "4px" }}>
                    {item.organization} · {item.date}
                  </div>

                  <p style={{ color: "var(--text-muted)", fontSize: "12.5px", margin: "4px 0 6px", maxWidth: "68ch", lineHeight: "1.5" }}>
                    {item.description}
                  </p>

                  {item.impact && (
                    <div style={{ fontSize: "12px", color: "var(--accent-cyan)", marginBottom: "6px" }}>
                      <strong>Impact:</strong> {item.impact}
                    </div>
                  )}

                  {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                      {item.highlights.map((h, hIdx) => (
                        <span key={hIdx} className="micro-tag">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Column */}
                <div className="admin-cert-actions-col">
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
          ))
        )}
      </div>
    </div>
  );
}

