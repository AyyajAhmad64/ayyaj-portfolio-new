import React, { useState, useEffect } from "react";
import { getGalleryAdmin, saveGalleryItem, deleteGalleryItem, reorderGallery } from "../../services/dataService";
import { uploadMediaFile } from "../../services/supabaseService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminGalleryPage() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = async () => {
    const data = await getGalleryAdmin();
    setList(data);
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

  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const reordered = [...list];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setList(reordered);
    try {
      await reorderGallery(reordered.map((g) => g.id));
    } catch (err) {
      console.warn("Reorder failed in cloud:", err);
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

        <Button onClick={handleCreate} variant="primary" size="sm">
          + Add Gallery Item
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
              <Button onClick={() => setEditing(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of gallery items with Reordering & Quick Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "16px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)", gridColumn: "1 / -1" }}>
            No gallery items found matching &quot;{searchQuery || categoryFilter}&quot;.
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px" }}>
              <div style={{ aspectRatio: "16/9", background: "var(--bg-base)", overflow: "hidden", borderRadius: "4px", marginBottom: "10px" }}>
                <img src={item.src} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "14px", color: "var(--text-bright)", margin: 0 }}>{item.title}</h3>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    background: (item.status === "draft") ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                    color: (item.status === "draft") ? "var(--accent-amber)" : "var(--accent-emerald)",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  {(item.status || "published").toUpperCase()}
                </span>
              </div>
              <span style={{ fontSize: "11.5px", color: "var(--accent-cyan)", marginBottom: "8px" }}>
                {item.category} · {item.date || "2026"}
              </span>
              {item.caption && (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", lineClamp: 2, marginBottom: "12px", flex: 1 }}>
                  {item.caption}
                </p>
              )}
              <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Reorder Buttons */}
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "3px 6px", fontSize: "11px", lineHeight: 1 }}
                    title="Move Up"
                    aria-label={`Move gallery item #${idx + 1} up`}
                  >
                    ▲
                  </button>
                  <span style={{ fontSize: "10.5px", color: "var(--accent-amber)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === filtered.length - 1}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "3px 6px", fontSize: "11px", lineHeight: 1 }}
                    title="Move Down"
                    aria-label={`Move gallery item #${idx + 1} down`}
                  >
                    ▼
                  </button>
                </div>

                {/* Edit & Delete Buttons */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                    Edit ✎
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "#f87171" }}
                    aria-label={`Delete gallery item ${item.title}`}
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
