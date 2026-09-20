import React, { useState, useEffect } from "react";
import { getSettings, updateSettings, getProfile, updateProfile } from "../../services/dataService";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

const SEO_PAGES = [
  { id: "global", name: "Global Defaults", path: "/" },
  { id: "home", name: "Home Page", path: "/" },
  { id: "about", name: "About Me", path: "/about" },
  { id: "projects", name: "Projects Catalog", path: "/projects" },
  { id: "experience", name: "Experience", path: "/experience" },
  { id: "education", name: "Education", path: "/education" },
  { id: "skills", name: "Technical Skills", path: "/skills" },
  { id: "certifications", name: "Certifications", path: "/certifications" },
  { id: "achievements", name: "Honors & Milestones", path: "/achievements" },
  { id: "gallery", name: "Visual Gallery", path: "/gallery" },
  { id: "contact", name: "Contact & Inquiries", path: "/contact" },
  { id: "resume", name: "Resume Document", path: "/resume" }
];

export default function AdminSeoPage() {
  const { refresh } = usePortfolioData();
  const [activePageId, setActivePageId] = useState("global");
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized with rich defaults
  const [seoData, setSeoData] = useState(() => {
    const initial = {
      global: {
        title: "Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing",
        metaDesc: "Software Developer specializing in Java, Spring Boot, React.js, and Cloud Computing (MCA).",
        keywords: "Software Developer, Full Stack Engineer, Java, Spring Boot, React.js, Cloud Computing, MCA, Pune",
        ogImage: "/profile.jpg",
        canonical: "https://ayyaj.dev/",
        noIndex: false
      }
    };
    SEO_PAGES.forEach((pg) => {
      if (pg.id !== "global") {
        initial[pg.id] = {
          title: `${pg.name} | Ayyaj Kalandar Shaikh`,
          metaDesc: `Explore ${pg.name.toLowerCase()} by Ayyaj Kalandar Shaikh — Software Developer and Cloud Computing Engineer.`,
          keywords: `Ayyaj Shaikh, ${pg.name}, Software Developer, Java, React.js`,
          ogImage: "/profile.jpg",
          canonical: `https://ayyaj.dev${pg.path}`,
          noIndex: false
        };
      }
    });
    return initial;
  });

  useEffect(() => {
    async function loadSeoSettings() {
      try {
        const [settingsData, profileData] = await Promise.all([
          getSettings(),
          getProfile()
        ]);

        if (settingsData || profileData) {
          setSeoData((prev) => {
            const updated = { ...prev };
            updated.global = {
              title: settingsData?.siteTitle || profileData?.name ? `${profileData.name} | Software Developer` : prev.global.title,
              metaDesc: profileData?.bio || prev.global.metaDesc,
              keywords: settingsData?.keywords || prev.global.keywords,
              ogImage: settingsData?.ogImage || profileData?.avatar || prev.global.ogImage,
              canonical: prev.global.canonical,
              noIndex: false
            };

            if (settingsData?.seoPages) {
              Object.keys(settingsData.seoPages).forEach((key) => {
                if (updated[key]) {
                  updated[key] = { ...updated[key], ...settingsData.seoPages[key] };
                }
              });
            }
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to load SEO settings:", err);
      }
    }
    loadSeoSettings();
  }, []);

  const currentConfig = seoData[activePageId] || seoData.global;

  const handleFieldChange = (field, value) => {
    setSeoData((prev) => ({
      ...prev,
      [activePageId]: {
        ...prev[activePageId],
        [field]: value
      }
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorNotice("");
    setNotice("");

    try {
      const globalConfig = seoData.global || {};
      const pageConfigs = { ...seoData };
      delete pageConfigs.global;

      await Promise.all([
        updateSettings({
          siteTitle: globalConfig.title,
          keywords: globalConfig.keywords,
          ogImage: globalConfig.ogImage,
          seoPages: pageConfigs
        }),
        updateProfile({ bio: globalConfig.metaDesc })
      ]);

      if (refresh) await refresh();
      setNotice(`✓ SEO settings for "${SEO_PAGES.find((p) => p.id === activePageId)?.name}" saved to Supabase.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      console.error("Failed to save SEO settings:", err);
      setErrorNotice(err.message || "Cloud save failed. Settings were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const getTitleStatus = (len) => {
    if (len === 0) return { label: "Empty", color: "var(--accent-rose)" };
    if (len >= 50 && len <= 60) return { label: "Optimal (50–60 chars)", color: "var(--accent-emerald)" };
    if (len < 50) return { label: "Short (Recommended 50–60)", color: "var(--accent-amber)" };
    return { label: "Too Long (>60 may truncate)", color: "var(--accent-rose)" };
  };

  const getDescStatus = (len) => {
    if (len === 0) return { label: "Empty", color: "var(--accent-rose)" };
    if (len >= 140 && len <= 160) return { label: "Optimal (140–160 chars)", color: "var(--accent-emerald)" };
    if (len < 140) return { label: "Short (Recommended 140–160)", color: "var(--accent-amber)" };
    return { label: "Too Long (>160 will truncate)", color: "var(--accent-rose)" };
  };

  const titleStatus = getTitleStatus(currentConfig.title?.length || 0);
  const descStatus = getDescStatus(currentConfig.metaDesc?.length || 0);
  const activePageObj = SEO_PAGES.find((p) => p.id === activePageId) || SEO_PAGES[0];

  return (
    <div className="admin-page">
      <SEO title="SEO & Discoverability — Admin CMS" description="Configure page metadata, titles, and social previews." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">SEARCH OPTIMIZATION</span>
          <h1 className="admin-page-title">SEO Manager 2.0</h1>
          <p className="admin-page-desc">
            Configure titles, meta descriptions, and OpenGraph social preview cards across all routes.
          </p>
        </div>

        <Button onClick={handleSave} variant="primary" size="sm" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {notice && (
        <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid var(--accent-emerald)", borderRadius: "var(--radius-sm)", color: "var(--accent-emerald)", fontSize: "13px", marginBottom: "20px" }}>
          {notice}
        </div>
      )}

      {errorNotice && (
        <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid var(--accent-rose)", borderRadius: "var(--radius-sm)", color: "var(--accent-rose)", fontSize: "13px", marginBottom: "20px" }}>
          {errorNotice}
        </div>
      )}

      {/* Page Selector Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "12px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        {SEO_PAGES.map((pg) => (
          <button
            key={pg.id}
            type="button"
            onClick={() => setActivePageId(pg.id)}
            className={`btn ${activePageId === pg.id ? "btn-primary" : "btn-outline"} btn-sm`}
            style={{ whiteSpace: "nowrap", fontSize: "12px", padding: "6px 12px" }}
          >
            {pg.name}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "28px", alignItems: "start" }}>
        {/* Editor Form */}
        <form onSubmit={handleSave} className="card" style={{ display: "grid", gap: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "15px", color: "var(--text-bright)", margin: 0 }}>
              Configuring: <span style={{ color: "var(--accent-cyan)" }}>{activePageObj.name}</span>
            </h2>
            <span style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              {activePageObj.path}
            </span>
          </div>

          {/* Page Title */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="admin-label" style={{ margin: 0 }}>PAGE TITLE</label>
              <span style={{ fontSize: "11px", fontWeight: 600, color: titleStatus.color }}>
                {currentConfig.title?.length || 0} chars · {titleStatus.label}
              </span>
            </div>
            <input
              type="text"
              required
              value={currentConfig.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="admin-input"
              placeholder="e.g. Projects | Ayyaj Kalandar Shaikh"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="admin-label" style={{ margin: 0 }}>META DESCRIPTION</label>
              <span style={{ fontSize: "11px", fontWeight: 600, color: descStatus.color }}>
                {currentConfig.metaDesc?.length || 0} chars · {descStatus.label}
              </span>
            </div>
            <textarea
              rows={3}
              required
              value={currentConfig.metaDesc || ""}
              onChange={(e) => handleFieldChange("metaDesc", e.target.value)}
              className="admin-textarea"
              placeholder="Engaging summary for search result snippets and social shares..."
            />
          </div>

          {/* Meta Keywords */}
          <div>
            <label className="admin-label">KEYWORDS (COMMA-SEPARATED)</label>
            <input
              type="text"
              value={currentConfig.keywords || ""}
              onChange={(e) => handleFieldChange("keywords", e.target.value)}
              className="admin-input"
              placeholder="Java, Spring Boot, React, Developer..."
            />
          </div>

          {/* OG Image */}
          <div>
            <label className="admin-label">SOCIAL PREVIEW IMAGE (OG:IMAGE)</label>
            <input
              type="text"
              value={currentConfig.ogImage || ""}
              onChange={(e) => handleFieldChange("ogImage", e.target.value)}
              className="admin-input"
              placeholder="/profile.jpg or https://..."
            />
          </div>

          {/* Canonical URL */}
          <div>
            <label className="admin-label">CANONICAL URL</label>
            <input
              type="url"
              value={currentConfig.canonical || ""}
              onChange={(e) => handleFieldChange("canonical", e.target.value)}
              className="admin-input"
              placeholder="https://ayyaj.dev/projects"
            />
          </div>

          {/* Robots / Indexing */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0" }}>
            <input
              type="checkbox"
              id="noIndexCheck"
              checked={Boolean(currentConfig.noIndex)}
              onChange={(e) => handleFieldChange("noIndex", e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--accent-cyan)" }}
            />
            <label htmlFor="noIndexCheck" style={{ fontSize: "13px", color: "var(--text-bright)", cursor: "pointer" }}>
              Disallow Search Engines (Add <code>noindex, nofollow</code> meta tag)
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save SEO Settings"}
            </Button>
          </div>
        </form>

        {/* Live Previews Panel */}
        <div style={{ display: "grid", gap: "20px" }}>
          {/* Google SERP Preview */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ fontSize: "16px" }}>🔍</span>
              <h3 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-bright)", margin: 0 }}>
                Google Search Result Snippet Preview
              </h3>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                color: "#202124",
                fontFamily: "Arial, sans-serif"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#4285f4", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "10px", fontWeight: "bold" }}>
                  A
                </div>
                <div style={{ fontSize: "12px", color: "#202124", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  ayyaj.dev <span style={{ color: "#5f6368" }}>› {activePageObj.id === "global" ? "" : activePageObj.id}</span>
                </div>
              </div>

              <div
                style={{
                  fontSize: "18px",
                  lineHeight: "1.3",
                  color: "#1a0dab",
                  fontWeight: 400,
                  marginBottom: "4px",
                  cursor: "pointer",
                  wordBreak: "break-word"
                }}
              >
                {currentConfig.title || "Untitled Page"}
              </div>

              <div style={{ fontSize: "13px", lineHeight: "1.5", color: "#4d5156", wordBreak: "break-word" }}>
                {currentConfig.metaDesc
                  ? (currentConfig.metaDesc.length > 155 ? `${currentConfig.metaDesc.slice(0, 155)}...` : currentConfig.metaDesc)
                  : "No meta description defined. Google will dynamically extract text from page content."}
              </div>
            </div>
          </div>

          {/* Social Share Card Preview (OpenGraph / LinkedIn / Twitter) */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ fontSize: "16px" }}>📱</span>
              <h3 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-bright)", margin: 0 }}>
                OpenGraph / Social Media Sharing Preview
              </h3>
            </div>

            <div
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                overflow: "hidden",
                background: "var(--bg-base)"
              }}
            >
              <div
                style={{
                  height: "160px",
                  background: "var(--bg-elevated)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  borderBottom: "1px solid var(--border-subtle)"
                }}
              >
                {currentConfig.ogImage ? (
                  <img
                    src={currentConfig.ogImage}
                    alt="Social Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "36px" }}>🖼️</span>
                )}
              </div>

              <div style={{ padding: "12px 14px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", fontFamily: "var(--font-mono)", display: "block", marginBottom: "4px" }}>
                  ayyaj.dev
                </span>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-bright)", margin: "0 0 6px", lineHeight: 1.3 }}>
                  {currentConfig.title || "Page Title"}
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4, lineClamp: 2 }}>
                  {currentConfig.metaDesc || "Social preview description..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
