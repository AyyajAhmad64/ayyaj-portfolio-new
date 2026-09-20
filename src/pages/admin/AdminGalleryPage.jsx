import React, { useState, useEffect, useMemo } from "react";
import { getGalleryAdmin, saveGalleryItem, deleteGalleryItem, reorderGallery } from "../../services/dataService";
import { uploadMediaFile } from "../../services/supabaseService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";
import AdminBulkActionsBar from "../../components/AdminBulkActionsBar";
import AdminContentPreviewModal from "../../components/AdminContentPreviewModal";
import { generateUniqueTitle } from "../../utils/slugUtils";

export default function AdminGalleryPage() {
  const [list, setList] = useState([]);
  const [savedOrderIds, setSavedOrderIds] = useState([]);
  const [selectedGalleryIds, setSelectedGalleryIds] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [draggedIdx, setDraggedIdx] = useState(null);

  const isOrderDirty = useMemo(() => {
    if (!savedOrderIds.length || savedOrderIds.length !== list.length) return false;
    return list.some((g, idx) => g.id !== savedOrderIds[idx]);
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
    reordered.forEach((g, idx) => {
      g.sortOrder = idx + 1;
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
    reordered.forEach((g, idx) => {
      g.sortOrder = idx + 1;
    });
    setList(reordered);
  };

  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);
      setErrorNotice("");
      const orderedIds = list.map((g) => g.id);
      await reorderGallery(orderedIds);
      setSavedOrderIds(orderedIds);
      setNotice("✓ Gallery order saved successfully to Supabase.");
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
    const map = new Map(list.map((g) => [g.id, g]));
    const restored = savedOrderIds.map((id) => map.get(id)).filter(Boolean);
    restored.forEach((g, idx) => {
      g.sortOrder = idx + 1;
    });
    setList(restored);
    setNotice("Order reset to last saved state.");
    setTimeout(() => setNotice(""), 2000);
  };

  const handleDuplicate = (item) => {
    const copyTitle = generateUniqueTitle(item.title, list.map((x) => x.title));
    setEditing({
      ...item,
      id: undefined,
      title: copyTitle,
      status: "draft"
    });
    setNotice(`Duplicated "${item.title}". Review and save.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectAll = () => {
    setSelectedGalleryIds(list.map((g) => g.id));
  };

  const handleDeselectAll = () => {
    setSelectedGalleryIds([]);
  };

  const toggleSelectGallery = (id) => {
    setSelectedGalleryIds((prev) =>
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
          await saveGalleryItem({ ...item, status: "published" });
        }
      }
      await loadData();
      setSelectedGalleryIds([]);
      setNotice(`✓ Successfully published ${ids.length} gallery items.`);
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
          await saveGalleryItem({ ...item, status: "draft" });
        }
      }
      await loadData();
      setSelectedGalleryIds([]);
      setNotice(`✓ Successfully set ${ids.length} gallery items to draft.`);
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
        await deleteGalleryItem(id);
      }
      await loadData();
      setSelectedGalleryIds([]);
      setNotice(`✓ Successfully deleted ${ids.length} gallery items.`);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setErrorNotice("Bulk delete failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const loadData = async () => {
    const data = await getGalleryAdmin();
    setList(data || []);
    setSavedOrderIds((data || []).map((g) => g.id));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item) => {
    setEditing({ ...item });
  };

  const handleCreate = () => {
    setEditing({
      title: "",
      category: "",
      src: "",
      thumbnail: "",
      alt: "",
      caption: "",
      date: "",
      status: "published",
      sortOrder: list.length + 1
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;

    try {
      setIsSaving(true);
      setErrorNotice("");
      await saveGalleryItem(editing);
      await loadData();
      setEditing(null);
      setNotice("Gallery item saved to Supabase.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to save gallery item:", err);
      setErrorNotice(err.message || "Cloud save failed. Your changes were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete gallery item "${title}"?`)) {
      try {
        setErrorNotice("");
        await deleteGalleryItem(id);
        await loadData();
        setNotice("Gallery item deleted from Supabase.");
        setTimeout(() => setNotice(""), 3000);
      } catch (err) {
        console.error("Failed to delete gallery item:", err);
        setErrorNotice(err.message || "Cloud deletion failed. Item was not deleted.");
      }
    }
  };

  const categories = ["All", ...Array.from(new Set(list.map((g) => g.category).filter(Boolean)))];

  const filtered = list.filter((item) => {
    if (categoryFilter !== "All" && item.category !== categoryFilter) return false;
    const itemStatus = item.status || "published";
    if (statusFilter !== "All" && itemStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.caption && item.caption.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-page">
      <SEO title="Manage Gallery — Admin CMS" description="Manage media gallery items." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">MEDIA REPOSITORY</span>
          <h1 className="admin-page-title">Gallery Management</h1>
          <p className="admin-page-desc">
            Add interface audits, project screenshots, and visual assets with category tagging and captions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button to="/gallery" target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
            Live Preview ↗
          </Button>
          <Button onClick={handleCreate} variant="primary" size="sm">
            + Add Gallery Item
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
            <span>You have unsaved gallery order changes. Reordering is pending cloud sync.</span>
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

      {/* Compact Responsive Filter Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-grid-3">
          <div className="admin-filter-field">
            <label className="admin-label">SEARCH GALLERY</label>
            <input
              type="text"
              className="admin-input"
              placeholder="Search by title, caption, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filter-field">
            <label className="admin-label">CATEGORY</label>
            <select
              className="admin-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {(searchQuery || categoryFilter !== "All" || statusFilter !== "All") ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("All");
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
            <h2 className="section-title-sm">Edit Gallery Item: {editing.title || "New Item"}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">ITEM TITLE</label>
                <input
                  type="text"
                  required
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">CATEGORY</label>
                <input
                  type="text"
                  required
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="admin-input"
                  placeholder="Projects, College, Events, Hackathons, Other"
                />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">IMAGE URL / PATH</label>
                <input
                  type="text"
                  required
                  value={editing.src}
                  onChange={(e) => setEditing({ ...editing, src: e.target.value, thumbnail: e.target.value })}
                  className="admin-input"
                  placeholder="/audit-mobile.png or external link"
                />
                <div style={{ marginTop: "6px" }}>
                  <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                    <span>📁 {isUploading ? "Uploading..." : "Upload Image to Cloud"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);
                        try {
                          const res = await uploadMediaFile(file, "portfolio-media", "gallery");
                          setEditing({ ...editing, src: res.url, thumbnail: res.url });
                        } catch (err) {
                          console.warn("Upload failed:", err);
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="admin-label">ACCESSIBLE ALT TEXT</label>
                <input
                  type="text"
                  value={editing.alt || ""}
                  onChange={(e) => setEditing({ ...editing, alt: e.target.value })}
                  className="admin-input"
                  placeholder="Descriptive explanation for screen readers"
                />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">DATE / YEAR</label>
                <input
                  type="text"
                  value={editing.date || ""}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. 2026 or Sep 2026"
                />
              </div>

              <div>
                <label className="admin-label">PUBLICATION STATUS</label>
                <select
                  value={editing.status || "published"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="admin-input"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="admin-label">CAPTION / CONTEXTUAL NOTE</label>
              <textarea
                rows={2}
                value={editing.caption || ""}
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div className="admin-form-actions">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Item"}
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
            checked={list.length > 0 && selectedGalleryIds.length === list.length}
            onChange={(e) => {
              if (e.target.checked) handleSelectAll();
              else handleDeselectAll();
            }}
            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-cyan)" }}
          />
          <span style={{ fontWeight: 600 }}>Select All ({list.length} gallery items)</span>
        </label>
        {selectedGalleryIds.length > 0 && (
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
            {selectedGalleryIds.length} of {list.length} selected
          </span>
        )}
      </div>

      {/* Gallery Cards Grid */}
      <div className="admin-gallery-grid">
        {filtered.length === 0 ? (
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
            No gallery items found matching &quot;{searchQuery || categoryFilter}&quot;.
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isSelected = selectedGalleryIds.includes(item.id);
            return (
              <div
                key={item.id || idx}
                className={`card admin-gallery-card admin-card ${draggedIdx === idx ? "is-dragging" : ""}`}
                draggable={!searchQuery && categoryFilter === "All" && statusFilter === "All"}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  padding: "16px",
                  cursor: !searchQuery && categoryFilter === "All" && statusFilter === "All" ? "grab" : "default",
                  opacity: draggedIdx === idx ? 0.5 : 1,
                  border: isSelected ? "1px solid var(--accent-cyan)" : undefined,
                  background: isSelected ? "rgba(56, 189, 248, 0.05)" : undefined,
                  transition: "transform 0.15s ease, box-shadow 0.15s ease"
                }}
              >
                {/* Header with Selection Checkbox and Status */}
                <div className="admin-card-header-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label className="admin-card-select-wrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectGallery(item.id)}
                      aria-label={`Select gallery item ${item.title}`}
                      style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-cyan)" }}
                      className="admin-card-checkbox"
                    />
                    <span className="admin-card-index-badge">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                  </label>
                  <span
                    className="admin-status-pill"
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      background: (item.status === "draft") ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: (item.status === "draft") ? "var(--accent-amber)" : "var(--accent-emerald)",
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "nowrap",
                      wordBreak: "normal",
                      overflowWrap: "normal",
                      flexShrink: 0,
                      display: "inline-flex"
                    }}
                  >
                    {(item.status || "published").toUpperCase()}
                  </span>
                </div>

                <div className="admin-gallery-card-img-wrap" style={{ aspectRatio: "16/9", background: "var(--bg-base)", overflow: "hidden", borderRadius: "6px", marginBottom: "10px", width: "100%" }}>
                  <img src={item.src} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-bright)", margin: "0 0 4px", wordBreak: "break-word" }}>{item.title}</h3>
                <span style={{ fontSize: "12px", color: "var(--accent-cyan)", marginBottom: "8px", fontWeight: "600" }}>
                  {item.category} · {item.date || "2026"}
                </span>

                {item.caption && (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineClamp: 2, marginBottom: "12px", flex: 1, wordBreak: "break-word" }}>
                    {item.caption}
                  </p>
                )}

                <div className="admin-gallery-card-footer" style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  {/* Reorder Buttons */}
                  <div className="admin-card-reorder-wrap">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="btn btn-ghost btn-sm admin-card-reorder-btn"
                      title="Move Up"
                      aria-label={`Move gallery item #${idx + 1} up`}
                    >
                      ↑
                    </button>
                    <span style={{ fontSize: "10.5px", color: "var(--accent-amber)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === filtered.length - 1}
                      className="btn btn-ghost btn-sm admin-card-reorder-btn"
                      title="Move Down"
                      aria-label={`Move gallery item #${idx + 1} down`}
                    >
                      ↓
                    </button>
                  </div>

                  {/* Actions Column */}
                  <div className="admin-gallery-actions-col admin-card-actions">
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
                      aria-label={`Delete gallery item ${item.title}`}
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
        selectedIds={selectedGalleryIds}
        totalCount={list.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkPublish={handleBulkPublish}
        onBulkDraft={handleBulkDraft}
        onBulkDelete={handleBulkDelete}
        itemTypeLabel="gallery items"
        selectedItems={list.filter((g) => selectedGalleryIds.includes(g.id))}
      />

      {/* Live Content Preview Modal */}
      <AdminContentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        type="gallery"
        data={editing}
      />
    </div>
  );
}
