import React, { useState, useEffect } from "react";
import { getMedia, saveMediaItem, deleteMediaItem } from "../../services/dataService";
import { uploadMediaFile } from "../../services/supabaseService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState([]);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    url: "",
    storagePath: "",
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || isUploading) return;

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const bucket = file.type === "application/pdf" ? "resume" : "portfolio-media";

    if (isSupabaseConfigured()) {
      setIsUploading(true);
      setErrorNotice("");
      try {
        const uploadRes = await uploadMediaFile(file, bucket, "media");
        setNewItem({
          name: file.name,
          url: uploadRes.url,
          storagePath: uploadRes.path,
          type: file.type || "application/octet-stream",
          size: sizeStr
        });
        setNotice(`Uploaded "${file.name}" to Supabase Storage (${bucket})`);
      } catch (err) {
        console.error("Direct cloud upload failed:", err);
        setErrorNotice(err.message || "Cloud upload failed. File was not uploaded.");
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    } else {
      setErrorNotice("Supabase is not configured. Media upload requires an active Supabase Cloud connection.");
      e.target.value = "";
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.url || isSaving || isUploading) return;

    try {
      setIsSaving(true);
      setErrorNotice("");
      await saveMediaItem({
        ...newItem,
        size: newItem.size || "Unknown size"
      });

      await loadMedia();
      setNewItem({ name: "", url: "", storagePath: "", type: "image/jpeg", size: "" });
      setShowAddForm(false);
      setNotice(`Media asset "${newItem.name}" saved to library.`);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to save media item:", err);
      setErrorNotice(err.message || "Cloud save failed. Media item was not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete media asset "${item.name}"?`)) {
      try {
        setErrorNotice("");
        await deleteMediaItem(item.id, item.storagePath);
        await loadMedia();
        setNotice(`Media asset "${item.name}" removed.`);
        setTimeout(() => setNotice(""), 3000);
      } catch (err) {
        console.error("Failed to delete media item:", err);
        setErrorNotice(err.message || "Cloud deletion failed. Media asset was not deleted.");
      }
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
            Store and manage assets in Supabase Cloud Storage (portfolio-media &amp; resume buckets). Upload photography, project screenshots, documents, and obtain instant public URLs.
          </p>
        </div>

        <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary" size="sm">
          {showAddForm ? "Close Form" : "+ Add Media Asset"}
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
          <h2 className="section-title-sm" style={{ marginBottom: "16px" }}>Upload Media Asset</h2>
          <form onSubmit={handleSaveItem} style={{ display: "grid", gap: "16px" }}>
            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">FILE SELECTOR (UPLOADS DIRECTLY TO SUPABASE STORAGE)</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="admin-input"
                  style={{ padding: "8px" }}
                />
                {isUploading && (
                  <span style={{ fontSize: "12px", color: "var(--accent-amber)", marginTop: "4px", display: "block" }}>
                    Uploading to cloud bucket...
                  </span>
                )}
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

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">PUBLIC URL OR PATH</label>
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
              <Button type="submit" variant="primary" disabled={isUploading || isSaving}>
                {isSaving ? "Saving Asset..." : "Save Asset to Media Library"}
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Media Grid */}
      <div className="admin-media-grid">
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
                    background: "var(--bg-base)",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "12px",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  {item.url}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(item)}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                >
                  {copiedId === item.id ? "✓ Copied" : "Copy URL"}
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  Open ↗
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
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
