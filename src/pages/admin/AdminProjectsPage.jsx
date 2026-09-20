import React, { useState, useEffect, useMemo } from "react";
import { getProjects, saveProject, deleteProject, reorderProjects } from "../../services/dataService";
import { uploadMediaFile } from "../../services/supabaseService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import ProjectThumbnail from "../../components/ProjectThumbnail";
import Button from "../../components/Button";
import SEO from "../../components/SEO";
import AdminBulkActionsBar from "../../components/AdminBulkActionsBar";
import AdminContentPreviewModal from "../../components/AdminContentPreviewModal";
import { generateUniqueSlug, generateUniqueTitle } from "../../utils/slugUtils";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [savedOrderIds, setSavedOrderIds] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const isOrderDirty = useMemo(() => {
    if (!savedOrderIds.length || savedOrderIds.length !== projects.length) return false;
    return projects.some((p, idx) => p.id !== savedOrderIds[idx]);
  }, [projects, savedOrderIds]);

  const getProjectCompleteness = (p) => {
    let score = 0;
    if (p.title) score += 15;
    if (p.description && p.description.length > 20) score += 20;
    if (p.stack) score += 10;
    if (Array.isArray(p.category) && p.category.length > 0) score += 10;
    if (Array.isArray(p.technologies) && p.technologies.length > 0) score += 15;
    if (Array.isArray(p.features) && p.features.length > 0) score += 10;
    if (p.liveDemo || p.github) score += 10;
    if (p.thumbnail || (Array.isArray(p.images) && p.images.length > 0)) score += 10;
    return Math.min(score, 100);
  };

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
    const reordered = [...projects];
    const [movedItem] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, movedItem);
    reordered.forEach((p, idx) => {
      p.sortOrder = idx + 1;
    });
    setProjects(reordered);
    setDraggedIdx(null);
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;
    const reordered = [...projects];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    reordered.forEach((p, idx) => {
      p.sortOrder = idx + 1;
    });
    setProjects(reordered);
  };

  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);
      setErrorNotice("");
      const orderedIds = projects.map((p) => p.id);
      await reorderProjects(orderedIds);
      setSavedOrderIds(orderedIds);
      setNotice("✓ Project order saved successfully to Supabase.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Project reorder failed in cloud:", err);
      setErrorNotice(err.message || "Failed to save project order.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetOrder = () => {
    if (!savedOrderIds.length) return;
    const map = new Map(projects.map((p) => [p.id, p]));
    const restored = savedOrderIds.map((id) => map.get(id)).filter(Boolean);
    restored.forEach((p, idx) => {
      p.sortOrder = idx + 1;
    });
    setProjects(restored);
    setNotice("Project order reset to last saved state.");
    setTimeout(() => setNotice(""), 2000);
  };

  const handleDuplicate = (p) => {
    const copyTitle = generateUniqueTitle(p.title, projects.map((x) => x.title));
    const copySlug = generateUniqueSlug(p.slug || p.title, projects.map((x) => x.slug));
    setEditingProject({
      ...p,
      id: undefined,
      title: copyTitle,
      slug: copySlug,
      publicationStatus: "draft",
      images: Array.isArray(p.images) ? [...p.images] : (p.thumbnail ? [p.thumbnail] : []),
      categoryStr: Array.isArray(p.category) ? p.category.join(", ") : p.category || "",
      techStr: Array.isArray(p.technologies) ? p.technologies.join(", ") : "",
      featuresStr: Array.isArray(p.features) ? p.features.join("\n") : ""
    });
    setIsCreating(true);
    setNotice(`Duplicated "${p.title}" as new draft project. Review and save.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectAll = () => {
    setSelectedProjectIds(projects.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedProjectIds([]);
  };

  const toggleSelectProject = (id) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = async (ids) => {
    setIsSaving(true);
    setErrorNotice("");
    try {
      for (const id of ids) {
        const p = projects.find((x) => x.id === id);
        if (p) {
          await saveProject({ ...p, publicationStatus: "published" });
        }
      }
      await loadProjects();
      setSelectedProjectIds([]);
      setNotice(`✓ Successfully published ${ids.length} projects.`);
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
        const p = projects.find((x) => x.id === id);
        if (p) {
          await saveProject({ ...p, publicationStatus: "draft" });
        }
      }
      await loadProjects();
      setSelectedProjectIds([]);
      setNotice(`✓ Successfully set ${ids.length} projects to draft.`);
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
        await deleteProject(id);
      }
      await loadProjects();
      setSelectedProjectIds([]);
      setNotice(`✓ Successfully deleted ${ids.length} projects.`);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setErrorNotice("Bulk delete failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const loadProjects = async () => {
    const list = await getProjects();
    setProjects(list);
    setSavedOrderIds(list.map((p) => p.id));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const emptyProject = {
    title: "",
    slug: "",
    type: "Full Stack Application",
    category: [],
    stack: "",
    status: "In Development",
    publicationStatus: "published",
    featured: false,
    description: "",
    problem: "",
    solution: "",
    architecture: "",
    challenges: "",
    learnings: "",
    technologies: [],
    features: [],
    github: "",
    liveDemo: "",
    thumbnail: "",
    images: []
  };

  const handleEdit = (p) => {
    setEditingProject({
      ...p,
      publicationStatus: p.publicationStatus || p.publication_status || "published",
      images: Array.isArray(p.images) ? [...p.images] : (p.thumbnail ? [p.thumbnail] : []),
      categoryStr: Array.isArray(p.category) ? p.category.join(", ") : p.category || "",
      techStr: Array.isArray(p.technologies) ? p.technologies.join(", ") : "",
      featuresStr: Array.isArray(p.features) ? p.features.join("\n") : ""
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingProject({
      ...emptyProject,
      images: [],
      categoryStr: "",
      techStr: "",
      featuresStr: ""
    });
    setIsCreating(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      setIsSaving(true);
      setErrorNotice("");

      const payload = {
        ...editingProject,
        images: Array.isArray(editingProject.images) ? editingProject.images.filter(Boolean) : [],
        category: editingProject.categoryStr.split(",").map((s) => s.trim()).filter(Boolean),
        technologies: editingProject.techStr.split(",").map((s) => s.trim()).filter(Boolean),
        features: editingProject.featuresStr.split("\n").map((s) => s.trim()).filter(Boolean),
        slug: editingProject.slug || editingProject.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        publicationStatus: editingProject.publicationStatus || "published"
      };

      delete payload.categoryStr;
      delete payload.techStr;
      delete payload.featuresStr;

      await saveProject(payload);
      await loadProjects();
      setEditingProject(null);
      setIsCreating(false);
      setNotice("Project successfully saved to Supabase.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to save project:", err);
      setErrorNotice(err.message || "Cloud save failed. Your changes were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete project "${title}"? This cannot be undone.`)) {
      try {
        setErrorNotice("");
        await deleteProject(id);
        await loadProjects();
        setNotice(`Project "${title}" deleted from Supabase.`);
        setTimeout(() => setNotice(""), 3000);
      } catch (err) {
        console.error("Failed to delete project:", err);
        setErrorNotice(err.message || "Cloud deletion failed. Project was not deleted.");
      }
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Manage Projects — Admin CMS" description="Manage developer projects repository." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">PORTFOLIO REGISTRY</span>
          <h1 className="admin-page-title">Projects Management</h1>
          <p className="admin-page-desc">
            Add new projects, update specifications, configure publication statuses (draft/published/archived), and upload screenshot galleries to Supabase Cloud Storage.
          </p>
        </div>

        <Button onClick={handleCreate} variant="primary" size="sm">
          + Add New Project
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

      {/* Editor Drawer / Modal Form */}
      {editingProject && (
        <div className="card" style={{ marginBottom: "32px", border: "2px solid var(--accent-cyan)" }}>
          <div className="section-row-header">
            <h2 className="section-title-sm">
              {isCreating ? "Create New Project" : `Edit Project: ${editingProject.title}`}
            </h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setEditingProject(null)}
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">PROJECT TITLE</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">URL SLUG (e.g. nexora)</label>
                <input
                  type="text"
                  value={editingProject.slug}
                  onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                  className="admin-input"
                  placeholder="auto-generated from title"
                />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">PROJECT TYPE / SUBTITLE</label>
                <input
                  type="text"
                  required
                  value={editingProject.type}
                  onChange={(e) => setEditingProject({ ...editingProject, type: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">DEVELOPMENT STATUS</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                  className="admin-input"
                >
                  <option value="In Development">In Development</option>
                  <option value="Completed">Completed</option>
                  <option value="Active Maintenance">Active Maintenance</option>
                </select>
              </div>

              <div>
                <label className="admin-label">PUBLICATION VISIBILITY</label>
                <select
                  value={editingProject.publicationStatus || "published"}
                  onChange={(e) => setEditingProject({ ...editingProject, publicationStatus: e.target.value })}
                  className="admin-input"
                  style={{ fontWeight: "600" }}
                >
                  <option value="published">🟢 Published (Publicly Visible)</option>
                  <option value="draft">🟡 Draft (Admin Only)</option>
                  <option value="archived">⚪ Archived</option>
                </select>
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">CATEGORIES (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  required
                  value={editingProject.categoryStr}
                  onChange={(e) => setEditingProject({ ...editingProject, categoryStr: e.target.value })}
                  className="admin-input"
                  placeholder="Full Stack, Java / Spring Boot, React / JavaScript"
                />
              </div>

              <div>
                <label className="admin-label">STACK SUMMARY LINE</label>
                <input
                  type="text"
                  required
                  value={editingProject.stack}
                  onChange={(e) => setEditingProject({ ...editingProject, stack: e.target.value })}
                  className="admin-input"
                  placeholder="React.js · Spring Boot · MySQL"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">SHORT OVERVIEW / SUMMARY (PROJECT CARD BIO)</label>
              <textarea
                rows={2}
                required
                value={editingProject.overview}
                onChange={(e) => setEditingProject({ ...editingProject, overview: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">THE PROBLEM / CHALLENGE (OPTIONAL)</label>
                <textarea
                  rows={3}
                  value={editingProject.problem || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, problem: e.target.value })}
                  className="admin-textarea"
                />
              </div>

              <div>
                <label className="admin-label">THE SOLUTION ARCHITECTURE (OPTIONAL)</label>
                <textarea
                  rows={3}
                  value={editingProject.solution || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                  className="admin-textarea"
                />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">SYSTEM ARCHITECTURE DETAILS</label>
                <textarea
                  rows={2}
                  value={editingProject.architecture || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, architecture: e.target.value })}
                  className="admin-textarea"
                />
              </div>

              <div>
                <label className="admin-label">KEY LEARNINGS</label>
                <textarea
                  rows={2}
                  value={editingProject.learnings || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, learnings: e.target.value })}
                  className="admin-textarea"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">TECHNOLOGY TAGS (COMMA-SEPARATED)</label>
              <input
                type="text"
                value={editingProject.techStr}
                onChange={(e) => setEditingProject({ ...editingProject, techStr: e.target.value })}
                className="admin-input"
                placeholder="React.js, JavaScript, Spring Boot, MySQL"
              />
            </div>

            <div>
              <label className="admin-label">KEY FEATURES (ONE PER LINE)</label>
              <textarea
                rows={3}
                value={editingProject.featuresStr}
                onChange={(e) => setEditingProject({ ...editingProject, featuresStr: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">GITHUB REPOSITORY URL</label>
                <input
                  type="url"
                  value={editingProject.github || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, github: e.target.value })}
                  className="admin-input"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="admin-label">LIVE DEMO URL (OPTIONAL)</label>
                <input
                  type="url"
                  value={editingProject.liveDemo || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, liveDemo: e.target.value })}
                  className="admin-input"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Visuals & Screenshot Gallery Management */}
            <div style={{ background: "var(--bg-elevated)", padding: "18px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "16px" }}>
              <div>
                <span className="section-micro-label" style={{ marginBottom: "4px" }}>PROJECT IMAGERY &amp; SHOWCASE</span>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-bright)", margin: "0 0 4px" }}>
                  Primary Thumbnail &amp; Screenshot Gallery
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                  Upload screenshots directly to Supabase Storage (portfolio-media bucket) or provide asset URLs. The primary thumbnail is used on portfolio cards, while all gallery screenshots appear in the interactive Project Detail carousel and fullscreen lightbox.
                </p>
              </div>

              {/* Cover Thumbnail */}
              <div style={{ padding: "14px", background: "var(--bg-base)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <label className="admin-label" style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>
                  PRIMARY COVER THUMBNAIL (CARD &amp; HERO PREVIEW)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={editingProject.thumbnail || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, thumbnail: e.target.value })}
                    className="admin-input"
                    placeholder="/audit-desktop.png or https://... or choose file below"
                  />
                  {editingProject.thumbnail && (
                    <button
                      type="button"
                      onClick={() => setEditingProject({ ...editingProject, thumbnail: "" })}
                      className="btn btn-outline btn-sm"
                      style={{ color: "var(--text-dim)" }}
                    >
                      Clear Cover
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
                  <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span>📁 {isUploading ? "Uploading..." : "Upload Cover to Cloud"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);

                        if (isSupabaseConfigured()) {
                          try {
                            const res = await uploadMediaFile(file, "portfolio-media", "projects");
                            const val = res.url;
                            const currentImgs = Array.isArray(editingProject.images) ? editingProject.images : [];
                            setEditingProject({
                              ...editingProject,
                              thumbnail: val,
                              images: currentImgs.includes(val) ? currentImgs : [val, ...currentImgs]
                            });
                            setIsUploading(false);
                            return;
                          } catch (err) {
                            console.warn("Cloud upload failed, falling back to FileReader:", err);
                          }
                        }

                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const val = ev.target.result;
                          const currentImgs = Array.isArray(editingProject.images) ? editingProject.images : [];
                          setEditingProject({
                            ...editingProject,
                            thumbnail: val,
                            images: currentImgs.includes(val) ? currentImgs : [val, ...currentImgs]
                          });
                          setIsUploading(false);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    PNG, JPG, WebP. Files are uploaded directly to Supabase Storage.
                  </span>
                </div>
              </div>

              {/* Additional Screenshot Gallery */}
              <div style={{ padding: "14px", background: "var(--bg-base)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <label className="admin-label" style={{ margin: 0 }}>
                      SCREENSHOT GALLERY ({Array.isArray(editingProject.images) ? editingProject.images.length : 0} SLIDES)
                    </label>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Screenshots appear in the interactive Project Detail carousel with thumbnail tabs and fullscreen lightbox.
                    </span>
                  </div>

                  <label className="btn btn-primary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span>+ {isUploading ? "Uploading..." : "Upload Screenshots to Cloud"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading}
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        setIsUploading(true);

                        for (const file of files) {
                          if (isSupabaseConfigured()) {
                            try {
                              const res = await uploadMediaFile(file, "portfolio-media", "projects");
                              const newSrc = res.url;
                              setEditingProject((prev) => {
                                const curr = Array.isArray(prev.images) ? prev.images : [];
                                if (curr.includes(newSrc)) return prev;
                                return {
                                  ...prev,
                                  images: [...curr, newSrc],
                                  thumbnail: prev.thumbnail || newSrc
                                };
                              });
                              continue;
                            } catch (err) {
                              console.warn("Cloud upload error, falling back to local:", err);
                            }
                          }

                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const newSrc = ev.target.result;
                            setEditingProject((prev) => {
                              const curr = Array.isArray(prev.images) ? prev.images : [];
                              if (curr.includes(newSrc)) return prev;
                              return {
                                ...prev,
                                images: [...curr, newSrc],
                                thumbnail: prev.thumbnail || newSrc
                              };
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                        setIsUploading(false);
                      }}
                    />
                  </label>
                </div>

                {/* Add screenshot by URL */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", marginBottom: "14px" }}>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or paste image URL/path (e.g. /audit-desktop.png) and press Enter"
                    className="admin-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!newImageUrl.trim()) return;
                        const curr = Array.isArray(editingProject.images) ? editingProject.images : [];
                        const url = newImageUrl.trim();
                        if (!curr.includes(url)) {
                          setEditingProject({
                            ...editingProject,
                            images: [...curr, url],
                            thumbnail: editingProject.thumbnail || url
                          });
                        }
                        setNewImageUrl("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newImageUrl.trim()) return;
                      const curr = Array.isArray(editingProject.images) ? editingProject.images : [];
                      const url = newImageUrl.trim();
                      if (!curr.includes(url)) {
                        setEditingProject({
                          ...editingProject,
                          images: [...curr, url],
                          thumbnail: editingProject.thumbnail || url
                        });
                      }
                      setNewImageUrl("");
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Gallery Images Strip */}
                {Array.isArray(editingProject.images) && editingProject.images.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
                    {editingProject.images.map((imgSrc, idx) => {
                      const isCover = editingProject.thumbnail === imgSrc;
                      return (
                        <div
                          key={idx}
                          style={{
                            border: isCover ? "2px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                            background: "var(--bg-elevated)",
                            display: "flex",
                            flexDirection: "column"
                          }}
                        >
                          <div style={{ position: "relative", height: "80px", background: "#05080e" }}>
                            <img
                              src={imgSrc}
                              alt={`Screenshot ${idx + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            {isCover && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  left: "4px",
                                  fontSize: "9px",
                                  fontWeight: "700",
                                  background: "var(--accent-cyan)",
                                  color: "var(--bg-base)",
                                  padding: "2px 5px",
                                  borderRadius: "2px"
                                }}
                              >
                                COVER
                              </span>
                            )}
                          </div>
                          <div style={{ padding: "6px", display: "flex", gap: "4px", justifyContent: "space-between", background: "var(--bg-surface)" }}>
                            {!isCover ? (
                              <button
                                type="button"
                                onClick={() => setEditingProject({ ...editingProject, thumbnail: imgSrc })}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--accent-cyan)",
                                  fontSize: "10.5px",
                                  cursor: "pointer",
                                  padding: "2px 4px"
                                }}
                              >
                                Make Cover
                              </button>
                            ) : (
                              <span style={{ fontSize: "10.5px", color: "var(--text-dim)", padding: "2px 4px" }}>
                                Active Cover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = editingProject.images.filter((_, i) => i !== idx);
                                setEditingProject({
                                  ...editingProject,
                                  images: filtered,
                                  thumbnail: editingProject.thumbnail === imgSrc ? (filtered[0] || "") : editingProject.thumbnail
                                });
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#f87171",
                                fontSize: "10.5px",
                                cursor: "pointer",
                                padding: "2px 4px"
                              }}
                              title="Delete screenshot"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: "16px", textAlign: "center", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-sm)", color: "var(--text-dim)", fontSize: "12px" }}>
                    No gallery screenshots uploaded yet. Add URLs or upload files to display in the project carousel.
                  </div>
                )}
              </div>

              {/* Live Preview Card */}
              <div style={{ maxWidth: "260px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Live Card Preview:
                </span>
                <ProjectThumbnail project={editingProject} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="featured"
                checked={Boolean(editingProject.featured)}
                onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
              />
              <label htmlFor="featured" style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent-amber)" }}>
                Featured on Homepage Spotlight &amp; Recruiter Briefing
              </label>
            </div>

            <div className="admin-form-actions">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Project"}
              </Button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsPreviewOpen(true)}
                style={{ borderColor: "var(--accent-cyan)", color: "var(--accent-cyan)" }}
              >
                👁 Live Preview (Draft)
              </button>
              <Button onClick={() => setEditingProject(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
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
            <span>You have unsaved project order changes. Changes are not yet persisted to Supabase.</span>
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

      {/* Search and Status Filter Bar */}
      <div className="admin-filter-bar admin-filter-grid-3">
        <div className="admin-filter-field">
          <label className="admin-filter-label">SEARCH PROJECTS</label>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, stack, or tech..."
            className="admin-input"
          />
        </div>
        <div className="admin-filter-field">
          <label className="admin-filter-label">PUBLICATION STATUS</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input"
          >
            <option value="All">All Statuses ({projects.length})</option>
            <option value="published">Published ({projects.filter((p) => (p.publicationStatus || p.publication_status || "published") === "published").length})</option>
            <option value="draft">Draft ({projects.filter((p) => (p.publicationStatus || p.publication_status) === "draft").length})</option>
            <option value="in-dev">In Development ({projects.filter((p) => p.status?.toLowerCase().includes("dev")).length})</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", height: "100%" }}>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
            }}
            className="btn btn-outline btn-sm"
            style={{ width: "100%", height: "38px" }}
          >
            Reset Filters
          </button>
        </div>
      </div>

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
            checked={projects.length > 0 && selectedProjectIds.length === projects.length}
            onChange={(e) => {
              if (e.target.checked) handleSelectAll();
              else handleDeselectAll();
            }}
            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-cyan)" }}
          />
          <span style={{ fontWeight: 600 }}>Select All ({projects.length} projects)</span>
        </label>
        {selectedProjectIds.length > 0 && (
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
            {selectedProjectIds.length} of {projects.length} selected
          </span>
        )}
      </div>

      {/* Projects Table / Card List */}
      <div style={{ display: "grid", gap: "16px" }}>
        {(() => {
          const filteredProjects = projects.filter((p) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
              !searchQuery ||
              p.title?.toLowerCase().includes(q) ||
              p.stack?.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q);
            const pStatus = p.publicationStatus || p.publication_status || "published";
            const matchesStatus =
              statusFilter === "All" ||
              (statusFilter === "published" && pStatus === "published") ||
              (statusFilter === "draft" && pStatus === "draft") ||
              (statusFilter === "in-dev" && p.status?.toLowerCase().includes("dev"));
            return matchesSearch && matchesStatus;
          });

          if (filteredProjects.length === 0) {
            return (
              <div className="card" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                No projects found matching the filter criteria.
              </div>
            );
          }

          return filteredProjects.map((p, idx) => {
            const pubStatus = p.publicationStatus || p.publication_status || "published";
            const completeness = getProjectCompleteness(p);
            const isDragging = draggedIdx === idx;
            const isSelected = selectedProjectIds.includes(p.id);

            return (
              <div
                key={p.id || idx}
                className={`card admin-project-row admin-project-card admin-card ${isDragging ? "is-dragging" : ""}`}
                draggable={!searchQuery && statusFilter === "All"}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                style={{
                  cursor: !searchQuery && statusFilter === "All" ? "grab" : "default",
                  opacity: isDragging ? 0.5 : 1,
                  border: isSelected ? "1px solid var(--accent-cyan)" : undefined,
                  background: isSelected ? "rgba(56, 189, 248, 0.05)" : undefined,
                  transition: "transform 0.15s ease, box-shadow 0.15s ease"
                }}
              >
                <div className="admin-project-card-inner">
                  {/* Compact Header Bar: Checkbox + Reorder Controls */}
                  <div className="admin-card-header-bar">
                    <label className="admin-card-select-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProject(p.id)}
                        aria-label={`Select project ${p.title}`}
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
                        aria-label={`Move project #${idx + 1} up`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === projects.length - 1}
                        className="btn btn-ghost btn-sm admin-card-reorder-btn"
                        title="Move Down"
                        aria-label={`Move project #${idx + 1} down`}
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail or Generated Fallback */}
                  <div className="admin-project-thumb-col">
                    <ProjectThumbnail project={p} />
                  </div>

                  <div className="admin-project-content-col">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-bright)", margin: 0, wordBreak: "break-word" }}>{p.title}</h3>
                      {p.featured && (
                        <span className="admin-status-pill featured-pill" style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "var(--accent-amber-soft)", color: "var(--accent-amber)", fontWeight: "700", border: "1px solid var(--accent-amber)", whiteSpace: "nowrap" }}>
                          FEATURED
                        </span>
                      )}
                      <span className={`project-status ${p.status?.toLowerCase().includes("dev") ? "in-development" : "completed"}`} style={{ whiteSpace: "nowrap" }}>
                        {p.status}
                      </span>
                      <span
                        className="admin-status-pill pub-pill"
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background:
                            pubStatus === "published"
                              ? "rgba(16, 185, 129, 0.15)"
                              : pubStatus === "draft"
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(100, 116, 139, 0.15)",
                          color:
                            pubStatus === "published"
                              ? "var(--accent-emerald)"
                              : pubStatus === "draft"
                              ? "var(--accent-amber)"
                              : "var(--text-dim)",
                          border: "1px solid currentColor",
                          whiteSpace: "nowrap",
                          wordBreak: "normal",
                          overflowWrap: "normal",
                          flexShrink: 0,
                          display: "inline-flex",
                          alignItems: "center"
                        }}
                      >
                        {pubStatus.toUpperCase()}
                      </span>
                      <span
                        className="admin-status-pill completeness-pill"
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: completeness >= 80 ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: completeness >= 80 ? "var(--accent-emerald)" : "var(--accent-amber)",
                          border: "1px solid currentColor",
                          fontFamily: "var(--font-mono)",
                          whiteSpace: "nowrap",
                          wordBreak: "normal",
                          overflowWrap: "normal",
                          flexShrink: 0,
                          display: "inline-flex",
                          alignItems: "center"
                        }}
                        title={`Completeness audit score: ${completeness}%`}
                      >
                        {completeness}% COMPLETE
                      </span>
                    </div>

                    <div style={{ fontSize: "12.5px", color: "var(--accent-cyan)", marginBottom: "3px", fontWeight: "600" }}>
                      {p.type}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", lineHeight: "1.4", wordBreak: "break-word" }}>
                      Stack: {p.stack}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                      Slug: <code style={{ color: "var(--text-main)" }}>/projects/{p.slug}</code>
                    </div>
                  </div>

                  <div className="admin-project-actions-col admin-card-actions">
                    <Button onClick={() => handleEdit(p)} variant="outline" size="sm" className="admin-action-btn">
                      Edit ✎
                    </Button>
                    <Button onClick={() => handleDuplicate(p)} variant="outline" size="sm" className="admin-action-btn">
                      Duplicate ⎘
                    </Button>
                    <Button
                      to={`/projects/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="ghost"
                      size="sm"
                      className="admin-action-btn"
                    >
                      View ↗
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.title)}
                      className="btn btn-ghost btn-sm admin-action-btn admin-delete-btn"
                      style={{ color: "#f87171" }}
                      aria-label={`Delete ${p.title}`}
                    >
                      Delete ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* Floating Bulk Actions Toolbar */}
      <AdminBulkActionsBar
        selectedIds={selectedProjectIds}
        totalCount={projects.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkPublish={handleBulkPublish}
        onBulkDraft={handleBulkDraft}
        onBulkDelete={handleBulkDelete}
        itemTypeLabel="projects"
        selectedItems={projects.filter((p) => selectedProjectIds.includes(p.id))}
      />

      {/* Live Content Preview Modal */}
      <AdminContentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        type="project"
        data={editingProject}
      />
    </div>
  );
}
