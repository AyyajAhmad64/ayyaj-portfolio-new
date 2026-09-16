import React, { useState, useEffect } from "react";
import { getGallery, saveGalleryItem, deleteGalleryItem } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminGalleryPage() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    const data = await getGallery();
    setList(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditing({
      title: "",
      category: "Projects",
      src: "/audit-desktop.png",
      thumbnail: "/audit-desktop.png",
      alt: "",
      date: "2026",
      caption: ""
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
    if (window.confirm(`Delete gallery image "${title}"?`)) {
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
            <h2 className="section-title-sm">Edit Gallery Item: {editing.title || "New Item"}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
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
              </div>

              <div>
                <label className="admin-label">ACCESSIBLE ALT TEXT</label>
                <input
                  type="text"
                  value={editing.alt}
                  onChange={(e) => setEditing({ ...editing, alt: e.target.value })}
                  className="admin-input"
                  placeholder="Descriptive explanation for screen readers"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">CAPTION / CONTEXTUAL NOTE</label>
              <textarea
                rows={2}
                value={editing.caption}
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Button type="submit" variant="primary">
                Save Item
              </Button>
              <Button onClick={() => setEditing(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {list.map((item) => (
          <div key={item.id} className="card">
            <div style={{ aspectRatio: "16/9", background: "var(--bg-base)", overflow: "hidden", borderRadius: "4px", marginBottom: "10px" }}>
              <img src={item.src} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h3 style={{ fontSize: "14px", color: "var(--text-bright)", margin: "0 0 4px" }}>{item.title}</h3>
            <span style={{ fontSize: "11.5px", color: "var(--accent-cyan)", marginBottom: "8px" }}>
              {item.category} · {item.date}
            </span>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineClamp: 2, marginBottom: "12px" }}>
              {item.caption}
            </p>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setEditing(item)} variant="outline" size="sm">
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
        ))}
      </div>
    </div>
  );
}

