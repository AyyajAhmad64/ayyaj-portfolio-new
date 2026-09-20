import React, { useState, useEffect, useMemo } from "react";
import { getAchievements, saveAchievement, deleteAchievement, reorderAchievements } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";
import AdminBulkActionsBar from "../../components/AdminBulkActionsBar";
import AdminContentPreviewModal from "../../components/AdminContentPreviewModal";
import { generateUniqueTitle, generateUniqueSlug } from "../../utils/slugUtils";

export default function AdminAchievementsPage() {
  const [list, setList] = useState([]);
  const [savedOrderIds, setSavedOrderIds] = useState([]);
  const [selectedAchievementIds, setSelectedAchievementIds] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [draggedIdx, setDraggedIdx] = useState(null);

  const isOrderDirty = useMemo(() => {
    if (!savedOrderIds.length || savedOrderIds.length !== list.length) return false;
    return list.some((a, idx) => a.id !== savedOrderIds[idx]);
  }, [list, savedOrderIds]);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const reordered = [...list];
    const [movedItem] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, movedItem);
    reordered.forEach((a, idx) => {
      a.sortOrder = idx + 1;
    });
    setList(reordered);
    setDraggedIdx(null);
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const reordered = [...list];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    reordered.forEach((a, idx) => {
      a.sortOrder = idx + 1;
    });
    setList(reordered);
  };

  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);
      setErrorNotice("");
      const orderedIds = list.map((item) => item.id);
      await reorderAchievements(orderedIds);
      setSavedOrderIds(orderedIds);
      setNotice("✓ Milestone order saved successfully to Supabase.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Reorder failed in cloud:", err);
      setErrorNotice(err.message || "Failed to save order.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetOrder = () => {
    if (!savedOrderIds.length) return;
    const map = new Map(list.map((a) => [a.id, a]));
    const restored = savedOrderIds.map((id) => map.get(id)).filter(Boolean);
    restored.forEach((a, idx) => {
      a.sortOrder = idx + 1;
    });
    setList(restored);
    setNotice("Order reset to last saved state.");
    setTimeout(() => setNotice(""), 2000);
  };

  const handleDuplicate = (item) => {
    const copyTitle = generateUniqueTitle(item.title, list.map((x) => x.title));
    const copySlug = generateUniqueSlug(item.slug || item.title, list.map((x) => x.slug));
    setEditing({
      ...item,
      id: undefined,
      title: copyTitle,
      slug: copySlug,
      highlightsStr: item.highlights ? item.highlights.join("\n") : ""
    });
    setNotice(`Duplicated "${item.title}". Review and save.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleSelectAll = () => {
    setSelectedAchievementIds(list.map((a) => a.id));
  };

  const handleDeselectAll = () => {
    setSelectedAchievementIds([]);
  };

  const toggleSelectAchievement = (id) => {
    setSelectedAchievementIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = async (ids) => {
    setIsSaving(true);
    setErrorNotice("");
    try {
      for (const id of ids) {
        const item = list.find((x) => x.id === id);
        if (item) {
          await saveAchievement({ ...item, publicationStatus: "published" });
        }
      }
      await loadData();
      setSelectedAchievementIds([]);
      setNotice(`✓ Successfully published ${ids.length} milestones.`);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setErrorNotice("Bulk publish failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkDraft = async (ids) => {
    setIsSaving(true);
    setErrorNotice("");
    try {
      for (const id of ids) {
        const item = list.find((x) => x.id === id);
        if (item) {
          await saveAchievement({ ...item, publicationStatus: "draft" });
        }
      }
      await loadData();
      setSelectedAchievementIds([]);
      setNotice(`✓ Successfully set ${ids.length} milestones to draft.`);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setErrorNotice("Bulk draft failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkDelete = async (ids) => {
    setIsSaving(true);
    setErrorNotice("");
    try {
      for (const id of ids) {
        await deleteAchievement(id);
      }
      await loadData();
      setSelectedAchievementIds([]);
      setNotice(`✓ Successfully deleted ${ids.length} milestones.`);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setErrorNotice("Bulk delete failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const loadData = async () => {
    const data = await getAchievements();
    setList(data || []);
    setSavedOrderIds((data || []).map((a) => a.id));
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

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button to="/achievements" target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
            Live Preview ↗
          </Button>
          <Button onClick={handleCreate} variant="primary" size="sm">
            + Add Milestone
          </Button>
        </div>
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

      {/* Unsaved Order Changes Indicator */}
      {isOrderDirty && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            padding: "12px 18px",
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid var(--accent-amber)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-amber)",
            marginBottom: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "13px" }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <span>You have unsaved milestone order changes. Reordering is pending cloud sync.</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={handleResetOrder}
              className="btn btn-outline btn-sm"
              style={{ borderColor: "var(--accent-amber)", color: "var(--accent-amber)", fontSize: "12px" }}
              disabled={isSaving}
            >
              Reset Order
            </button>
            <button
              type="button"
              onClick={handleSaveOrder}
              className="btn btn-primary btn-sm"
              style={{ fontSize: "12px" }}
              disabled={isSaving}
            >
              {isSaving ? "Saving Order..." : "Save Order"}
            </button>
          </div>
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
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsPreviewOpen(true)}
                style={{ borderColor: "var(--accent-cyan)", color: "var(--accent-cyan)" }}
              >
                👁 Live Preview (Draft)
              </button>
              <Button onClick={() => setEditing(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Select All / Counter Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "16px 0 8px",
          padding: "4px 8px",
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)"
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-bright)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={list.length > 0 && selectedAchievementIds.length === list.length}
            onChange={(e) => {
              if (e.target.checked) handleSelectAll();
              else handleDeselectAll();
            }}
            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-cyan)" }}
          />
          <span style={{ fontWeight: 600 }}>Select All ({list.length} milestones)</span>
        </label>
        {selectedAchievementIds.length > 0 && (
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
            {selectedAchievementIds.length} of {list.length} selected
          </span>
        )}
      </div>

      {/* List of Milestones */}
      <div style={{ display: "grid", gap: "16px" }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
            No milestones found matching the filter criteria.
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isSelected = selectedAchievementIds.includes(item.id);
            return (
              <div
                key={item.id || idx}
                className={`card admin-achievement-card admin-card ${draggedIdx === idx ? "is-dragging" : ""}`}
                draggable={!searchQuery && typeFilter === "All"}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                style={{
                  cursor: !searchQuery && typeFilter === "All" ? "grab" : "default",
                  opacity: draggedIdx === idx ? 0.5 : 1,
                  border: isSelected ? "1px solid var(--accent-cyan)" : undefined,
                  background: isSelected ? "rgba(56, 189, 248, 0.05)" : undefined,
                  transition: "transform 0.15s ease, box-shadow 0.15s ease"
                }}
              >
                <div className="admin-achievement-card-inner admin-cert-card-inner">
                  {/* Compact Header Bar: Checkbox + Reorder Controls */}
                  <div className="admin-card-header-bar">
                    <label className="admin-card-select-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectAchievement(item.id)}
                        aria-label={`Select milestone ${item.title}`}
                        className="admin-card-checkbox"
                      />
                      <span className="admin-card-index-badge">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                    </label>

                    <div className="admin-card-reorder-wrap">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="btn btn-ghost btn-sm admin-card-reorder-btn"
                        title="Move Up"
                        aria-label={`Move milestone #${idx + 1} up`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === filtered.length - 1}
                        className="btn btn-ghost btn-sm admin-card-reorder-btn"
                        title="Move Down"
                        aria-label={`Move milestone #${idx + 1} down`}
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail / Media Column */}
                  <div
                    className="admin-achievement-thumb-col admin-cert-thumb-col"
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "6px",
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
                  <div className="admin-achievement-content-col admin-cert-content-col">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span className="achievement-micro-tag">{item.type}</span>
                      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-bright)", margin: 0, wordBreak: "break-word" }}>{item.title}</h3>
                    </div>

                    <div style={{ color: "var(--accent-amber)", fontSize: "12.5px", marginBottom: "4px", fontWeight: "600" }}>
                      {item.organization} · {item.date}
                    </div>

                    <p style={{ color: "var(--text-muted)", fontSize: "12.5px", margin: "4px 0 6px", maxWidth: "68ch", lineHeight: "1.5", wordBreak: "break-word" }}>
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
                          <span key={hIdx} className="micro-tag" style={{ whiteSpace: "normal", wordBreak: "break-word", maxWidth: "100%" }}>
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="admin-achievement-actions-col admin-cert-actions-col admin-card-actions">
                    <Button onClick={() => handleEdit(item)} variant="outline" size="sm" className="admin-action-btn">
                      Edit ✎
                    </Button>
                    <Button onClick={() => handleDuplicate(item)} variant="outline" size="sm" className="admin-action-btn">
                      Duplicate ⎘
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="btn btn-ghost btn-sm admin-action-btn admin-delete-btn"
                      style={{ color: "#f87171" }}
                    >
                      Delete ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>


      {/* Floating Bulk Actions Toolbar */}
      <AdminBulkActionsBar
        selectedIds={selectedAchievementIds}
        totalCount={list.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkPublish={handleBulkPublish}
        onBulkDraft={handleBulkDraft}
        onBulkDelete={handleBulkDelete}
        itemTypeLabel="milestones"
        selectedItems={list.filter((a) => selectedAchievementIds.includes(a.id))}
      />

      {/* Live Content Preview Modal */}
      <AdminContentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        type="achievement"
        data={editing}
      />
    </div>
  );
}

