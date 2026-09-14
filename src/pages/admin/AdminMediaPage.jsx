import React, { useState, useEffect } from "react";
import { getMedia, saveMediaItem, deleteMediaItem } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState([]);
  const [notice, setNotice] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    url: "",
    type: "image/jpeg",
    size: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const loadMedia = async () => {
    const list = await getMedia();
    setMediaList(list);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleCopyUrl = (item) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setNotice(`Copied "${item.url}" to clipboard!`);
    setTimeout(() => {
      setCopiedId(null);
      setNotice("");
    }, 2500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    // For images, generate preview Data URL
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewItem({
          name: file.name,
          url: event.target.result,
          type: file.type,
          size: sizeStr
        });
      };
      reader.readAsDataURL(file);
    } else {
      setNewItem({
        name: file.name,
        url: `/${file.name}`,
        type: file.type || "application/octet-stream",
        size: sizeStr
      });
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.url) return;

    await saveMediaItem({
      ...newItem,
      size: newItem.size || "Unknown size"
    });

    await loadMedia();
    setNewItem({ name: "", url: "", type: "image/jpeg", size: "" });
    setShowAddForm(false);
    setNotice(`Media asset "${newItem.name}" added successfully.`);
    setTimeout(() => setNotice(""), 3000);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete media asset "${name}"?`)) {
      await deleteMediaItem(id);
      await loadMedia();
      setNotice(`Media asset "${name}" removed.`);
      setTimeout(() => setNotice(""), 3000);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Media Library — Admin CMS" description="Manage static assets and media files." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">STORAGE &amp; ASSETS</span>
          <h1 className="admin-page-title">Media Library</h1>
          <p className="admin-page-desc">
            Store and manage references to profile photography, project thumbnails, document PDFs, and brand assets.
          </p>
        </div>

        <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary" size="sm">
          {showAddForm ? "Close Form" : "+ Add Media Asset"}
        </Button>
      </div>

      {notice && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid var(--accent-emerald)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-emerald)",
            fontSize: "13px",
            marginBottom: "20px"
          }}
        >
          {notice}
        </div>
      )}

      {showAddForm && (
        <div className="card" style={{ marginBottom: "28px", border: "2px solid var(--accent-cyan)" }}>
          <h2 className="section-title-sm" style={{ marginBottom: "16px" }}>Add Media Asset</h2>
          <form onSubmit={handleSaveItem} style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">FILE SELECTOR (AUTOMATIC URL &amp; SIZE EXTRACTION)</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="admin-input"
                  style={{ padding: "8px" }}
                />
              </div>

              <div>
                <label className="admin-label">ASSET NAME / FILENAME</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. system-architecture-v2.png"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">URL OR PATH (RELATIVE OR ABSOLUTE)</label>
                <input
                  type="text"
                  required
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  className="admin-input"
                  placeholder="/profile.jpg, /resume.pdf, or https://..."
                />
              </div>

              <div>
                <label className="admin-label">MIME TYPE</label>
                <input
                  type="text"
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="admin-input"
                  placeholder="image/jpeg, image/png, application/pdf"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <Button type="submit" variant="primary">
                Save Asset to Media Library
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Media Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {mediaList.map((item) => {
          const isImg = item.type?.startsWith("image/") || item.url?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
          return (
            <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", padding: "16px" }}>
              <div
                style={{
                  height: "160px",
                  background: "var(--bg-card-hover)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginBottom: "12px",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                {isImg ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.innerHTML = `<span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); text-align: center; padding: 10px;">${item.name}</span>`;
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "16px" }}>
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>📄</div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {item.type || "DOCUMENT"}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text-bright)",
                    marginBottom: "4px",
                    wordBreak: "break-all"
                  }}
                >
                  {item.name}
                </h3>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>
                  {item.size} • {item.date || "Active"}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--accent-cyan)",
                    fontFamily: "var(--font-mono)",
                    wordBreak: "break-all",
                    background: "rgba(0,0,0,0.3)",
                    padding: "6px 8px",
                    borderRadius: "4px",
                    marginBottom: "12px"
                  }}
                >
                  {item.url.length > 50 ? `${item.url.slice(0, 47)}...` : item.url}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                <Button
                  onClick={() => handleCopyUrl(item)}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {copiedId === item.id ? "✓ Copied!" : "Copy Path"}
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.name)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "#f87171" }}
                  aria-label={`Delete ${item.name}`}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

