import React, { useState, useEffect, useMemo } from "react";
import { getMedia, saveMediaItem, deleteMediaItem } from "../../services/dataService";
import { uploadMediaFile } from "../../services/supabaseService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminMediaPage() {
  const {
    refresh,
    projects = [],
    certifications = [],
    achievements = [],
    gallery = [],
    profile = {}
  } = usePortfolioData();
  const [mediaList, setMediaList] = useState([]);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [previewItem, setPreviewItem] = useState(null);

  // Modals state
  const [inspectedRefAsset, setInspectedRefAsset] = useState(null);
  const [deleteTargetAsset, setDeleteTargetAsset] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    url: "",
    storagePath: "",
    type: "image/jpeg",
    size: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const getMediaReferences = (item) => {
    if (!item?.url) return [];
    const url = item.url;
    const refs = [];

    // Check Projects
    projects.forEach((p) => {
      if (p.thumbnail === url) {
        refs.push({ type: "Project Thumbnail", title: p.title, link: "/admin/projects" });
      }
      if (Array.isArray(p.images) && p.images.includes(url)) {
        refs.push({ type: "Project Gallery", title: p.title, link: "/admin/projects" });
      }
    });

    // Check Certifications
    certifications.forEach((c) => {
      if (c.image === url || c.certificateUrl === url) {
        refs.push({ type: "Certification Credential", title: c.name, link: "/admin/certifications" });
      }
    });

    // Check Achievements
    achievements.forEach((a) => {
      if (a.image === url) {
        refs.push({ type: "Achievement Milestone", title: a.title, link: "/admin/achievements" });
      }
    });

    // Check Gallery
    gallery.forEach((g) => {
      if (g.src === url || g.thumbnail === url) {
        refs.push({ type: "Visual Gallery Item", title: g.title, link: "/admin/gallery" });
      }
    });

    // Check Profile
    if (profile?.avatar === url) {
      refs.push({ type: "Profile Avatar", title: profile.name || "Ayyaj Shaikh", link: "/admin/profile" });
    }
    const resumeUrl = profile?.snapshot?.resume?.pdfUrl || profile?.resumeUrl;
    if (resumeUrl === url) {
      refs.push({ type: "Resume Document", title: "PDF Resume", link: "/admin/resume" });
    }

    return refs;
  };

  const loadMedia = async () => {
    const list = await getMedia();
    setMediaList(list || []);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.url && item.url.toLowerCase().includes(q)) ||
        (item.type && item.type.toLowerCase().includes(q));

      const isImg = item.type?.startsWith("image") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.url);
      const isDoc = item.type === "application/pdf" || /\.pdf$/i.test(item.url);
      const refs = getMediaReferences(item);
      const isReferenced = refs.length > 0;

      let matchesType = true;
      if (typeFilter === "images") matchesType = isImg;
      else if (typeFilter === "documents") matchesType = isDoc;
      else if (typeFilter === "in-use") matchesType = isReferenced;
      else if (typeFilter === "unused") matchesType = !isReferenced;

      return matchesSearch && matchesType;
    });
  }, [mediaList, searchQuery, typeFilter, projects, certifications, achievements, gallery, profile]);

  const handleCopyUrl = (item) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setNotice(`✓ Copied URL for "${item.name}" to clipboard.`);
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
      if (typeof refresh === "function") {
        try {
          await refresh();
        } catch {
          // non-blocking
        }
      }
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

  const executeDelete = async () => {
    if (!deleteTargetAsset) return;
    try {
      setIsDeleting(true);
      setErrorNotice("");
      await deleteMediaItem(deleteTargetAsset.id, deleteTargetAsset.storagePath);
      await loadMedia();
      if (typeof refresh === "function") {
        try {
          await refresh();
        } catch {
          // non-blocking
        }
      }
      setNotice(`Media asset "${deleteTargetAsset.name}" deleted from library.`);
      setDeleteTargetAsset(null);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to delete media item:", err);
      setErrorNotice(err.message || "Cloud deletion failed. Media asset was not deleted.");
    } finally {
      setIsDeleting(false);
    }
  };

  const unusedCount = useMemo(() => {
    return mediaList.filter((m) => getMediaReferences(m).length === 0).length;
  }, [mediaList, projects, certifications, achievements, gallery, profile]);

  return (
    <div className="admin-page">
      <SEO title="Media Library 2.0 — Admin CMS" description="Manage static assets and media files." />



      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">STORAGE &amp; ASSETS</span>
          <h1 className="admin-page-title">Media Library 2.0</h1>
          <p className="admin-page-desc">
            Store and manage assets in Supabase Cloud Storage. Track usage references, inspect orphaned files, and copy public URLs.
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
        <div className="card admin-upload-card" style={{ marginBottom: "28px", border: "2px solid var(--accent-cyan)" }}>
          <h2 className="section-title-sm" style={{ marginBottom: "16px" }}>Upload Media Asset</h2>
          <form onSubmit={handleSaveItem} className="admin-media-form">
            <div className="admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-label">FILE SELECTOR (UPLOADS DIRECTLY TO SUPABASE STORAGE)</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="admin-input admin-file-input"
                />
                {isUploading && (
                  <span style={{ fontSize: "12px", color: "var(--accent-amber)", marginTop: "4px", display: "block" }}>
                    Uploading to cloud bucket...
                  </span>
                )}
              </div>

              <div className="admin-form-field">
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
              <div className="admin-form-field">
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

              <div className="admin-form-field">
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

            <div className="admin-form-actions">
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

      {/* Search and Filters Bar */}
      <div
        className="card"
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          padding: "12px 12px",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", gap: "10px", flex: "1 1 min(100%, 200px)", minWidth: 0 }}>
          <input
            type="text"
            className="admin-input"
            placeholder="🔍 Search filename, URL, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%" }}
          />
          {searchQuery && (
            <Button size="sm" variant="ghost" onClick={() => setSearchQuery("")}>
              Clear
            </Button>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Filter:
          </span>
          {[
            { id: "All", label: "All" },
            { id: "images", label: "Images" },
            { id: "documents", label: "Documents" },
            { id: "in-use", label: "In Use" },
            { id: "unused", label: `Unused (${unusedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${typeFilter === tab.id ? "btn-primary" : "btn-outline"}`}
              onClick={() => setTypeFilter(tab.id)}
              style={{ fontSize: "11px", padding: "4px 10px" }}
            >
              {tab.label}
            </button>
          ))}
          <span style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginLeft: "8px" }}>
            Showing {filteredMedia.length} of {mediaList.length}
          </span>
        </div>
      </div>


      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", marginBottom: "20px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {searchQuery || typeFilter !== "All"
              ? "No media assets match your search or filter criteria."
              : "No media assets found in library. Click \"+ Add Media Asset\" to upload."}
          </p>
          {(searchQuery || typeFilter !== "All") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("All");
              }}
              style={{ marginTop: "12px" }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="admin-media-grid">
          {filteredMedia.map((item) => {
            const isImg = item.type?.startsWith("image/") || item.url?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
            const refs = getMediaReferences(item);
            const isReferenced = refs.length > 0;

            return (
              <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", padding: "16px" }}>
                <div
                  onClick={() => setPreviewItem(item)}
                  title="Click to preview"
                  style={{
                    height: "160px",
                    background: "var(--bg-card-hover)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    marginBottom: "12px",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer"
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

                  {/* Reference Usage Badge (Interactive) */}
                  <div
                    onClick={() => isReferenced && setInspectedRefAsset({ item, refs })}
                    style={{
                      fontSize: "11px",
                      padding: "5px 9px",
                      borderRadius: "4px",
                      background: isReferenced ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.1)",
                      color: isReferenced ? "var(--accent-emerald)" : "var(--accent-amber)",
                      border: isReferenced ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                      marginBottom: "12px",
                      fontFamily: "var(--font-mono)",
                      cursor: isReferenced ? "pointer" : "default",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                    title={isReferenced ? "Click to view referencing content" : "Orphaned asset"}
                  >
                    <span>
                      {isReferenced ? `✓ In Use (${refs.length} ref${refs.length > 1 ? "s" : ""})` : "Unused / Orphaned"}
                    </span>
                    {isReferenced && <span style={{ fontSize: "10px", opacity: 0.8 }}>Details 🔍</span>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "auto", minWidth: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item)}
                    className="btn btn-outline btn-sm"
                    style={{ flex: "1 1 auto" }}
                  >
                    {copiedId === item.id ? "✓ Copied" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="btn btn-ghost btn-sm"
                    title="Preview"
                  >
                    Preview
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
                    onClick={() => setDeleteTargetAsset({ item, refs })}
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
      )}

      {/* Preview Modal */}
      {/* Reference Inspection Modal */}
      {inspectedRefAsset && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "500px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid var(--border-strong)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🔗</span>
                <h3 style={{ fontSize: "16px", color: "var(--text-bright)", margin: 0 }}>
                  Asset References ({inspectedRefAsset.refs.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedRefAsset(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "16px" }}>
              The asset <strong>{inspectedRefAsset.item.name}</strong> is currently utilized in the following portfolio content:
            </div>

            <div style={{ display: "grid", gap: "8px", marginBottom: "20px" }}>
              {inspectedRefAsset.refs.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg-base)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <span style={{ fontSize: "10.5px", color: "var(--accent-cyan)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                      {r.type}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text-bright)", fontWeight: 600 }}>
                      {r.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => setInspectedRefAsset(null)} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Delete Confirmation Modal */}
      {deleteTargetAsset && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid var(--accent-rose)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🗑️</span>
                <h3 style={{ fontSize: "16px", color: "var(--accent-rose)", margin: 0 }}>
                  Confirm Media Deletion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTargetAsset(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-bright)", margin: "0 0 14px" }}>
              Delete asset: <strong>{deleteTargetAsset.item.name}</strong>?
            </p>

            {deleteTargetAsset.refs.length > 0 ? (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid var(--accent-rose)",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "16px"
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--accent-rose)", fontSize: "12.5px", marginBottom: "6px" }}>
                  ⚠️ DANGER: ACTIVE REFERENCES DETECTED!
                </div>
                <div style={{ fontSize: "12px", color: "#fca5a5", lineHeight: 1.4 }}>
                  This asset is currently in use by <strong>{deleteTargetAsset.refs.length}</strong> portfolio item(s):
                  <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                    {deleteTargetAsset.refs.map((r, i) => (
                      <li key={i}>{r.type}: {r.title}</li>
                    ))}
                  </ul>
                  Deleting this asset will cause broken images or missing documents on your live website.
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "12.5px", color: "var(--text-dim)", margin: "0 0 16px" }}>
                This asset is not currently referenced anywhere in your portfolio content and can be safely deleted.
              </p>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Button onClick={() => setDeleteTargetAsset(null)} variant="outline" size="sm" disabled={isDeleting}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={executeDelete}
                className="btn btn-primary btn-sm"
                style={{ background: "var(--accent-rose)", borderColor: "var(--accent-rose)" }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewItem(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              padding: "24px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ minWidth: 0, paddingRight: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-bright)", wordBreak: "break-all" }}>
                  {previewItem.name}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                  {previewItem.type || "Asset"} • {previewItem.size || "Unknown size"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "16px", lineHeight: 1 }}
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "240px",
                background: "var(--bg-base)",
                borderRadius: "var(--radius-sm)",
                marginBottom: "16px",
                padding: "16px",
                overflow: "hidden"
              }}
            >
              {previewItem.type?.startsWith("image/") || previewItem.url?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? (
                <img
                  src={previewItem.url}
                  alt={previewItem.name}
                  style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
                />
              ) : previewItem.type === "application/pdf" || previewItem.url?.endsWith(".pdf") ? (
                <iframe
                  src={previewItem.url}
                  title={previewItem.name}
                  style={{ width: "100%", height: "50vh", border: "none" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "32px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>📄</div>
                  <p style={{ fontSize: "14px", color: "var(--text-bright)" }}>Non-image preview</p>
                  <p style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                    {previewItem.url}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleCopyUrl(previewItem)}
                className="btn btn-outline btn-sm"
              >
                {copiedId === previewItem.id ? "✓ Copied URL" : "Copy Public URL"}
              </button>
              <a
                href={previewItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                Open in New Tab ↗
              </a>
              <Button variant="ghost" size="sm" onClick={() => setPreviewItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
