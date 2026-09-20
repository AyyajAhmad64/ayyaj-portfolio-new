import React, { useState, useEffect, useMemo } from "react";
import { getProfile, updateProfile, getSettings, updateSettings } from "../../services/dataService";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import { resolveHomeContent } from "../../utils/contentDefaults";
import { defaultFeaturedItems } from "../../components/FeaturedSection";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export function getDerivedCtaLabel(item) {
  if (!item || !item.type || !item.contentId) return "Auto-derived after selecting item";
  switch (item.type) {
    case "project":
      return "Explore Case Study →";
    case "certification":
      return "Verify Credential →";
    case "gallery":
      return "View Gallery →";
    case "achievement":
      return "View Details →";
    case "experience":
      return "View Experience →";
    default:
      return "View Details →";
  }
}

export function getEntityPreviewData(item, { projects, certifications, gallery, achievements, experience }) {
  if (!item || !item.type || !item.contentId) return null;
  if (item.type === "project") {
    const p = (projects || []).find((proj) => proj.slug === item.contentId || proj.id === item.contentId);
    if (!p) return null;
    return {
      title: p.title,
      category: p.type || "Project",
      meta: Array.isArray(p.technologies) ? p.technologies.slice(0, 3).join(" • ") : p.stack || "Architecture",
      thumb: p.thumbnail || p.image || null,
      fallbackIcon: "⚡"
    };
  }
  if (item.type === "certification") {
    const c = (certifications || []).find((cert) => cert.id === item.contentId);
    if (!c) return null;
    return {
      title: c.name || c.title,
      category: "Certification",
      meta: `${c.issuer} · ${c.date || "2026"}`,
      thumb: c.image || (c.certificateUrl && /\.(png|jpe?g|webp|gif|svg)$/i.test(c.certificateUrl) ? c.certificateUrl : null),
      fallbackIcon: "📜"
    };
  }
  if (item.type === "gallery") {
    const g = (gallery || []).find((gal) => gal.id === item.contentId || gal.slug === item.contentId);
    if (!g) return null;
    return {
      title: g.title,
      category: g.category || "Visual",
      meta: `${g.category || "Gallery"} · ${g.date || "2026"}`,
      thumb: g.src || g.thumbnail || g.imageUrl || null,
      fallbackIcon: "📷"
    };
  }
  if (item.type === "achievement") {
    const a = (achievements || []).find((ach) => ach.id === item.contentId || ach.slug === item.contentId);
    if (!a) return null;
    return {
      title: a.title,
      category: a.type || "Milestone",
      meta: `${a.organization} · ${a.date || "2026"}`,
      thumb: a.image || null,
      fallbackIcon: "🏆"
    };
  }
  if (item.type === "experience") {
    const e = (experience || []).find((exp) => exp.id === item.contentId);
    if (!e) return null;
    return {
      title: `${e.role} @ ${e.company}`,
      category: e.employmentType || "Experience",
      meta: `${e.location} · ${e.startDate}–${e.endDate}`,
      thumb: null,
      fallbackIcon: "💼"
    };
  }
  return null;
}

export default function AdminHomePage() {
  const {
    refresh,
    projects = [],
    certifications = [],
    gallery = [],
    experience = [],
    achievements = []
  } = usePortfolioData();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("hero"); // 'hero' | 'featured' | 'sections' | 'principles' | 'cta'
  const [featuredList, setFeaturedList] = useState([]);
  const [initialFeaturedList, setInitialFeaturedList] = useState([]);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isFeaturedOrderDirty = useMemo(() => {
    if (!initialFeaturedList.length || initialFeaturedList.length !== featuredList.length) return false;
    return featuredList.some((item, idx) => (item.contentId || item.id) !== (initialFeaturedList[idx].contentId || initialFeaturedList[idx].id));
  }, [featuredList, initialFeaturedList]);

  // Hero State
  const [hero, setHero] = useState({
    currentRole: "",
    heroRolePrimary: "",
    heroRoleSecondary: "",
    heroStackPillsStr: "",
    bio: "",
    availability: "",
    showAvailability: true,
    heroFrameCaption: "",
    heroFrameSub: ""
  });

  // Section Headers State
  const [sectionHeaders, setSectionHeaders] = useState({
    featuredHeading: "",
    featuredDesc: "",
    experienceHeading: "",
    experienceDesc: "",
    skillsHeading: "",
    skillsDesc: "",
    educationHeading: "",
    educationDesc: "",
    achievementsHeading: "",
    achievementsDesc: "",
    certificationsHeading: "",
    certificationsDesc: "",
    galleryHeading: "",
    galleryDesc: ""
  });

  // Engineering Principles State
  const [principles, setPrinciples] = useState([
    { title: "", subtitle: "", desc: "" },
    { title: "", subtitle: "", desc: "" },
    { title: "", subtitle: "", desc: "" },
    { title: "", subtitle: "", desc: "" }
  ]);

  // Contact CTA State
  const [contactCta, setContactCta] = useState({
    heading: "",
    subheading: "",
    primaryBtn: "",
    secondaryBtn: ""
  });

  useEffect(() => {
    async function load() {
      const [p, s] = await Promise.all([getProfile(), getSettings()]);
      if (!p) return;
      setProfile(p);
      setSettings(s || {});

      const home = resolveHomeContent(p, s);

      setHero({
        currentRole: p.currentRole || "",
        heroRolePrimary: home.heroRolePrimary,
        heroRoleSecondary: home.heroRoleSecondary,
        heroStackPillsStr: Array.isArray(home.heroStackPills) ? home.heroStackPills.join(", ") : "",
        bio: p.bio || "",
        availability: p.availability || "",
        showAvailability: s?.showAvailabilityBadge ?? true,
        heroFrameCaption: home.heroFrameCaption,
        heroFrameSub: home.heroFrameSub
      });

      setSectionHeaders({
        featuredHeading: home.featuredHeading,
        featuredDesc: home.featuredDesc,
        experienceHeading: home.experienceHeading,
        experienceDesc: home.experienceDesc,
        skillsHeading: home.skillsHeading,
        skillsDesc: home.skillsDesc,
        educationHeading: home.educationHeading,
        educationDesc: home.educationDesc,
        achievementsHeading: home.achievementsHeading,
        achievementsDesc: home.achievementsDesc,
        certificationsHeading: home.certificationsHeading,
        certificationsDesc: home.certificationsDesc,
        galleryHeading: home.galleryHeading,
        galleryDesc: home.galleryDesc
      });

      setPrinciples(
        Array.isArray(home.principles) && home.principles.length > 0
          ? home.principles
          : [
              { title: "Layered Clean Architecture", subtitle: "Controller-Service-Repository", desc: "" },
              { title: "Relational Persistence & Integrity", subtitle: "Normalized Data Modeling", desc: "" },
              { title: "Practical Full-Stack Execution", subtitle: "React Frontend + REST Contracts", desc: "" },
              { title: "Continuous Learning & Modernization", subtitle: "Cloud & AI Integrations", desc: "" }
            ]
      );

      setContactCta({
        heading: home.contactCtaHeading,
        subheading: home.contactCtaSubheading,
        primaryBtn: home.contactCtaButtonText,
        secondaryBtn: home.contactEmailButtonText
      });
      let feats;
      if (Array.isArray(s?.featuredItems)) {
        feats = s.featuredItems;
      } else if (Array.isArray(p?.snapshot?.home?.featuredItems)) {
        feats = p.snapshot.home.featuredItems;
      } else {
        feats = defaultFeaturedItems;
      }
      setFeaturedList(feats);
      setInitialFeaturedList(feats);
    }
    load();
  }, []);

  const handleAddFeaturedItem = () => {
    const newId = `feat-${Date.now()}`;
    const newItem = {
      id: newId,
      type: "",
      contentId: "",
      badge: "",
      tagline: "",
      ctaLabel: "",
      enabled: true,
      sortOrder: featuredList.length + 1,
      isNew: true
    };
    setFeaturedList((prev) => [...prev, newItem]);

    setTimeout(() => {
      const el = document.getElementById(newId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = el.querySelector("select, input");
        if (input) input.focus();
      }
    }, 100);
  };

  const handleUpdateFeaturedItem = (index, updates) => {
    const updated = [...featuredList];
    updated[index] = { ...updated[index], ...updates };
    setFeaturedList(updated);
  };

  const handleDeleteFeaturedItem = (index) => {
    const updated = featuredList.filter((_, i) => i !== index);
    setFeaturedList(updated);
  };

  const handleMoveFeaturedItem = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= featuredList.length) return;
    const updated = [...featuredList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((item, i) => {
      item.sortOrder = i + 1;
    });
    setFeaturedList(updated);
  };

  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(index));
    } catch {
      // ignore
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const updated = [...featuredList];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, removed);
    updated.forEach((item, i) => {
      item.sortOrder = i + 1;
    });
    setFeaturedList(updated);
    setDraggedIdx(null);
  };

  const handleResetOrder = () => {
    const updated = [...featuredList].map((item, i) => ({
      ...item,
      sortOrder: i + 1
    }));
    setFeaturedList(updated);
    if (!initialFeaturedList.length) return;
    setFeaturedList([...initialFeaturedList]);
    setNotice("Featured Showcase order reset to last saved state.");
    setTimeout(() => setNotice(""), 2000);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);

    try {
      const stackPillsArray = hero.heroStackPillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const homeSnapshot = {
        ...(profile?.snapshot?.home || {}),
        heroRolePrimary: hero.heroRolePrimary,
        heroRoleSecondary: hero.heroRoleSecondary,
        heroStackPills: stackPillsArray,
        heroFrameCaption: hero.heroFrameCaption,
        heroFrameSub: hero.heroFrameSub,
        featuredItems: featuredList,

        // Headers
        featuredHeading: sectionHeaders.featuredHeading,
        featuredDesc: sectionHeaders.featuredDesc,
        experienceHeading: sectionHeaders.experienceHeading,
        experienceDesc: sectionHeaders.experienceDesc,
        skillsHeading: sectionHeaders.skillsHeading,
        skillsDesc: sectionHeaders.skillsDesc,
        educationHeading: sectionHeaders.educationHeading,
        educationDesc: sectionHeaders.educationDesc,
        achievementsHeading: sectionHeaders.achievementsHeading,
        achievementsDesc: sectionHeaders.achievementsDesc,
        certificationsHeading: sectionHeaders.certificationsHeading,
        certificationsDesc: sectionHeaders.certificationsDesc,
        galleryHeading: sectionHeaders.galleryHeading,
        galleryDesc: sectionHeaders.galleryDesc,

        // Principles
        principlesHeading: "How I Build",
        principlesDesc: "Core engineering tenets that guide software design, implementation decisions, and team collaborations.",
        principles: principles,

        // CTA
        contactCtaHeading: contactCta.heading,
        contactCtaSubheading: contactCta.subheading,
        contactCtaButtonText: contactCta.primaryBtn,
        contactEmailButtonText: contactCta.secondaryBtn
      };

      const updatedSnapshot = {
        ...(profile?.snapshot || {}),
        home: homeSnapshot,
        currentPosition: hero.currentRole || profile?.snapshot?.currentPosition
      };

      const [, savedSettings] = await Promise.all([
        updateProfile({
          currentRole: hero.currentRole,
          bio: hero.bio,
          availability: hero.availability,
          snapshot: updatedSnapshot
        }),
        updateSettings({
          showAvailabilityBadge: hero.showAvailability,
          featuredItems: featuredList
        })
      ]);

      setErrorNotice("");
      setInitialFeaturedList([...featuredList]);
      if (refresh) await refresh();

      if (savedSettings?.__featuredItemsPendingMigration) {
        setNotice("✓ Saved to Supabase! (Note: Run migration 20260917000000_featured_and_gallery_sort.sql in Supabase SQL editor to persist featured_items permanently).");
        setTimeout(() => setNotice(""), 6000);
      } else {
        setNotice("✓ Home page configuration and content successfully saved to Supabase!");
        setTimeout(() => setNotice(""), 3500);
      }
      setNotice("✓ Home page configuration and content successfully saved to Supabase!");
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      console.error("Failed to save home page:", err);
      setErrorNotice(err.message || "Cloud save failed. Your changes were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return <div className="admin-page">Loading Home page settings...</div>;

  return (
    <div className="admin-page" style={{ width: "100%", maxWidth: "1100px", marginInline: "auto", boxSizing: "border-box", minWidth: 0 }}>
      <SEO title="Home Page Management — Admin CMS" description="Manage homepage hero and section copy." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">CONTENT / HOME</span>
          <h1 className="admin-page-title">Home Page Management</h1>
          <p className="admin-page-desc">
            Full content control center for the primary portfolio landing page: Hero narrative, section titles, engineering principles, and call-to-action blocks.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button to="/" target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
            View Live Home ↗
          </Button>
          <Button onClick={handleSave} variant="primary" size="sm" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Home Changes"}
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
          <span>⚠️ <strong>Cloud save failed:</strong> {errorNotice}</span>
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

      {/* Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", marginBottom: "24px" }}>
        {[
          { id: "hero", label: "1. Hero & Identity" },
          { id: "featured", label: "2. Featured Showcase" },
          { id: "sections", label: "3. Section Headings & Subtitles" },
          { id: "principles", label: "4. How I Build (Principles)" },
          { id: "cta", label: "5. Contact CTA Banner" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn btn-sm ${activeTab === tab.id ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} style={{ display: "grid", gap: "24px" }}>
        {/* TAB 1: HERO */}
        {activeTab === "hero" && (
          <div className="card" style={{ display: "grid", gap: "16px" }}>
            <h2 className="section-title-sm">Hero Section Positioning &amp; Status</h2>

            <div>
              <label className="admin-label">ACTIVE STATUS PILL / CURRENT ROLE</label>
              <input
                type="text"
                required
                value={hero.currentRole}
                onChange={(e) => setHero({ ...hero, currentRole: e.target.value })}
                className="admin-input"
                placeholder="e.g. MERN Stack + AI Intern @ BQARLSON Software Pvt. Ltd."
              />
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">PRIMARY ROLE (HERO BAR LEFT)</label>
                <input
                  type="text"
                  required
                  value={hero.heroRolePrimary}
                  onChange={(e) => setHero({ ...hero, heroRolePrimary: e.target.value })}
                  className="admin-input"
                  placeholder="Software Developer"
                />
              </div>

              <div>
                <label className="admin-label">SECONDARY ROLE (HERO BAR RIGHT)</label>
                <input
                  type="text"
                  required
                  value={hero.heroRoleSecondary}
                  onChange={(e) => setHero({ ...hero, heroRoleSecondary: e.target.value })}
                  className="admin-input"
                  placeholder="Full Stack Developer"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">STACK PILLS LIST (COMMA-SEPARATED)</label>
              <input
                type="text"
                value={hero.heroStackPillsStr}
                onChange={(e) => setHero({ ...hero, heroStackPillsStr: e.target.value })}
                className="admin-input"
                placeholder="Java, Spring Boot, React.js, ASP.NET Core, Cloud Computing"
              />
            </div>

            <div>
              <label className="admin-label">PRIMARY ELEVATOR PITCH / BIO</label>
              <textarea
                rows={3}
                required
                value={hero.bio}
                onChange={(e) => setHero({ ...hero, bio: e.target.value })}
                className="admin-textarea"
                placeholder="Building reliable full-stack applications with Java, Spring Boot, React.js..."
              />
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">HERO PHOTO FRAME LABEL</label>
                <input
                  type="text"
                  value={hero.heroFrameCaption}
                  onChange={(e) => setHero({ ...hero, heroFrameCaption: e.target.value })}
                  className="admin-input"
                  placeholder="ENGINEERING PROFILE"
                />
              </div>

              <div>
                <label className="admin-label">HERO PHOTO FRAME SUBTITLE</label>
                <input
                  type="text"
                  value={hero.heroFrameSub}
                  onChange={(e) => setHero({ ...hero, heroFrameSub: e.target.value })}
                  className="admin-input"
                  placeholder="Ayyaj Shaikh · MCA Cloud"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">OPPORTUNITY AVAILABILITY STATEMENT</label>
              <input
                type="text"
                value={hero.availability}
                onChange={(e) => setHero({ ...hero, availability: e.target.value })}
                className="admin-input"
                placeholder="Available for Software Engineering &amp; Cloud opportunities"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <input
                type="checkbox"
                id="showAvailability"
                checked={hero.showAvailability}
                onChange={(e) => setHero({ ...hero, showAvailability: e.target.checked })}
              />
              <label htmlFor="showAvailability" style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent-cyan)" }}>
                Display live status indicator on Hero
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: FEATURED SHOWCASE */}
        {activeTab === "featured" && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
            <div className="section-row-header" style={{ flexWrap: "wrap", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: "1 1 280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span className="section-micro-label" style={{ color: "var(--accent-amber)" }}>HOMEPAGE CONTENT &gt; FEATURED SHOWCASE</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      background: "rgba(56, 189, 248, 0.12)",
                      color: "var(--accent-cyan)",
                      border: "1px solid rgba(56, 189, 248, 0.3)"
                    }}
                  >
                    {featuredList.filter((i) => i.enabled !== false && Boolean(i.contentId)).length} active items ({featuredList.length} total)
                  </span>
                </div>
                <h2 className="section-title-sm" style={{ margin: "6px 0" }}>Featured Showcase Curator</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
                  Select, drag, and arrange the flagship projects, verified credentials, and visual spotlights displayed in the curated home page showcase.
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <Button type="button" onClick={handleAddFeaturedItem} variant="primary" size="sm">
                  + Add Featured Item
                </Button>
                <button
                  type="button"
                  onClick={handleResetOrder}
                  disabled={featuredList.length <= 1}
                  className="btn btn-outline btn-sm"
                  title="Normalize sort orders sequentially 1..N"
                  style={{ opacity: featuredList.length <= 1 ? 0.4 : 1 }}
                >
                  Reset Order
                </button>
                <a
                  href="/#projects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  title="Open live public Featured Work section in new tab"
                >
                  Preview Featured Work ↗
                </a>
              </div>
            </div>

            {/* Unsaved Order Changes Indicator */}
            {isFeaturedOrderDirty && (
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
                  <span>You have unsaved showcase order changes. Click &quot;Save Configuration&quot; to commit to Supabase.</span>
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
                    onClick={handleSave}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: "12px" }}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Configuration"}
                  </button>
                </div>
              </div>
            )}

            {/* List of Featured Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", minWidth: 0 }}>
              {featuredList.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "36px 20px",
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px dashed var(--border-subtle)",
                    color: "var(--text-muted)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "28px" }}>📭</span>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--text-bright)" }}>
                    No featured items configured
                  </p>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-dim)", maxWidth: "420px" }}>
                    The public homepage Featured Showcase section is currently hidden. Click the button below to curate your first spotlight item.
                  </p>
                  <Button type="button" onClick={handleAddFeaturedItem} variant="primary" size="sm">
                    + Add First Featured Item
                  </Button>
                </div>
              ) : (
                featuredList.map((item, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === featuredList.length - 1;
                const isUnconfigured = !item.type || !item.contentId;
                const entityData = getEntityPreviewData(item, { projects, certifications, gallery, achievements, experience });

                return (
                  <div
                    key={item.id || idx}
                    id={item.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={() => setDraggedIdx(null)}
                    className={`admin-featured-card ${item.isNew || isUnconfigured ? "is-new" : ""}`}
                    style={{
                      opacity: draggedIdx === idx ? 0.45 : 1,
                      transition: "opacity 0.15s ease",
                      cursor: "grab"
                    }}
                  >
                    {/* 1. Header: Order controls, Title / Status, Active toggle, Delete */}
                    <div className="admin-featured-card-header">
                      <div className="admin-featured-card-title-group">
                        <span title="Drag to reorder" style={{ cursor: "grab", color: "var(--text-dim)", fontSize: "16px", userSelect: "none" }}>
                          ⠿
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--accent-amber)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                          #{String(idx + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-bright)", textTransform: "capitalize" }}>
                          {item.type ? `${item.type} Spotlight` : "New Spotlight"}
                        </span>
                        {isUnconfigured && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              background: "rgba(56, 189, 248, 0.15)",
                              color: "var(--accent-cyan)",
                              border: "1px solid rgba(56, 189, 248, 0.3)",
                              letterSpacing: "0.04em"
                            }}
                          >
                            SELECT ENTITY
                          </span>
                        )}
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: item.enabled !== false ? "var(--accent-emerald)" : "var(--text-muted)", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={item.enabled !== false}
                            onChange={(e) => handleUpdateFeaturedItem(idx, { enabled: e.target.checked })}
                          />
                          <span>{item.enabled !== false ? "Active on Home" : "Inactive (Hidden)"}</span>
                        </label>
                      </div>

                      <div className="admin-featured-card-actions">
                        <div style={{ display: "inline-flex", gap: "4px" }}>
                          <button
                            type="button"
                            onClick={() => handleMoveFeaturedItem(idx, -1)}
                            disabled={isFirst}
                            title="Move item up"
                            aria-label={`Move item ${idx + 1} up`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: "4px 8px", fontSize: "11px", opacity: isFirst ? 0.35 : 1, cursor: isFirst ? "not-allowed" : "pointer" }}
                          >
                            ↑ Move Up
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveFeaturedItem(idx, 1)}
                            disabled={isLast}
                            title="Move item down"
                            aria-label={`Move item ${idx + 1} down`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: "4px 8px", fontSize: "11px", opacity: isLast ? 0.35 : 1, cursor: isLast ? "not-allowed" : "pointer" }}
                          >
                            ↓ Move Down
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeaturedItem(idx)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: "#f87171", padding: "4px 8px", fontSize: "11px" }}
                          aria-label={`Delete item ${idx + 1}`}
                          title="Delete featured item"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>

                    {/* 2. Content Configuration: Type & Linked Entity */}
                    <div className="admin-featured-form-section">
                      <h4 className="admin-featured-section-label">1. Content Source &amp; Entity</h4>
                      <div className="admin-featured-grid-2">
                        <div>
                          <label className="admin-label">CONTENT TYPE</label>
                          <select
                            className="admin-input"
                            value={item.type || ""}
                            onChange={(e) => {
                              const newType = e.target.value;
                              handleUpdateFeaturedItem(idx, {
                                type: newType,
                                contentId: "",
                                isNew: false
                              });
                            }}
                          >
                            <option value="">[ Select Content Type ]</option>
                            <option value="project">Project</option>
                            <option value="certification">Certification</option>
                            <option value="gallery">Gallery Visual Item</option>
                            <option value="achievement">Achievement</option>
                            <option value="experience">Experience Spotlight</option>
                          </select>
                        </div>

                        <div>
                          <label className="admin-label">LINKED ENTITY</label>
                          {!item.type && (
                            <select className="admin-input" disabled value="">
                              <option value="">[ Select content type first ]</option>
                            </select>
                          )}
                          {item.type === "project" && (
                            <select
                              className="admin-input"
                              value={item.contentId || ""}
                              onChange={(e) => handleUpdateFeaturedItem(idx, { contentId: e.target.value, isNew: false })}
                            >
                              <option value="">-- Select a project to feature --</option>
                              {projects.map((p) => (
                                <option key={p.id} value={p.slug || p.id}>
                                  {p.title} ({p.type})
                                </option>
                              ))}
                            </select>
                          )}
                          {item.type === "certification" && (
                            <select
                              className="admin-input"
                              value={item.contentId || ""}
                              onChange={(e) => handleUpdateFeaturedItem(idx, { contentId: e.target.value, isNew: false })}
                            >
                              <option value="">-- Select a certification to feature --</option>
                              {certifications.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name || c.title} ({c.issuer})
                                </option>
                              ))}
                              {!certifications.some((c) => c.id === "azure-devops-cert") && (
                                <option value="azure-devops-cert">
                                  Mastering Azure DevOps: From Beginner to Advanced 2026 (Udemy / Uday Academy)
                                </option>
                              )}
                            </select>
                          )}
                          {item.type === "gallery" && (
                            <select
                              className="admin-input"
                              value={item.contentId || ""}
                              onChange={(e) => handleUpdateFeaturedItem(idx, { contentId: e.target.value, isNew: false })}
                            >
                              <option value="">-- Select a gallery item to feature --</option>
                              {gallery.map((g) => (
                                <option key={g.id} value={g.id}>
                                  {g.title} ({g.category || "Visual"})
                                </option>
                              ))}
                            </select>
                          )}
                          {item.type === "achievement" && (
                            <select
                              className="admin-input"
                              value={item.contentId || ""}
                              onChange={(e) => handleUpdateFeaturedItem(idx, { contentId: e.target.value, isNew: false })}
                            >
                              <option value="">-- Select an achievement to feature --</option>
                              {achievements.map((a) => (
                                <option key={a.id} value={a.id || a.slug}>
                                  {a.title} ({a.organization})
                                </option>
                              ))}
                            </select>
                          )}
                          {item.type === "experience" && (
                            <select
                              className="admin-input"
                              value={item.contentId || ""}
                              onChange={(e) => handleUpdateFeaturedItem(idx, { contentId: e.target.value, isNew: false })}
                            >
                              <option value="">-- Select an experience to feature --</option>
                              {experience.map((e) => (
                                <option key={e.id} value={e.id}>
                                  {e.role} @ {e.company}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      {/* Live Entity Preview in Admin Card */}
                      {entityData && (
                        <div className="admin-featured-preview-panel">
                          <div className="admin-featured-preview-thumb">
                            {entityData.thumb ? (
                              <img
                                src={entityData.thumb}
                                alt={entityData.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: "20px", background: "var(--bg-base)" }}>
                                {entityData.fallbackIcon}
                              </div>
                            )}
                          </div>
                          <div className="admin-featured-preview-info">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "3px", background: "rgba(56, 189, 248, 0.15)", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
                                {entityData.category}
                              </span>
                              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                {entityData.meta}
                              </span>
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-bright)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={entityData.title}>
                              {entityData.title}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--accent-amber)", marginTop: "2px" }}>
                              Action: {getDerivedCtaLabel(item)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Display Configuration: Custom Badge & CTA Label */}
                    <div className="admin-featured-form-section">
                      <h4 className="admin-featured-section-label">2. Card Display Badges &amp; Actions</h4>
                      <div className="admin-featured-grid-2">
                        <div>
                          <label className="admin-label">CUSTOM BADGE</label>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="e.g. Flagship Platform, Industry Credential"
                            value={item.badge || ""}
                            onChange={(e) => handleUpdateFeaturedItem(idx, { badge: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="admin-label">AUTOMATIC PRIMARY CTA</label>
                          <div
                            className="admin-input"
                            style={{
                              background: "rgba(255, 255, 255, 0.03)",
                              color: "var(--accent-cyan)",
                              display: "flex",
                              alignItems: "center",
                              fontWeight: "600",
                              cursor: "default"
                            }}
                          >
                            {getDerivedCtaLabel(item)}
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", marginTop: "4px" }}>
                            Auto-derived from selected entity type
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Optional Presentation: Tagline / Summary Override */}
                    <div className="admin-featured-form-section">
                      <h4 className="admin-featured-section-label">3. Optional Narrative Override</h4>
                      <div>
                        <label className="admin-label">CUSTOM TAGLINE / SUMMARY (OPTIONAL OVERRIDE)</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="Leave empty to use entity's default description"
                          value={item.tagline || ""}
                          onChange={(e) => handleUpdateFeaturedItem(idx, { tagline: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* Bottom Actions for Featured Tab */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-subtle)"
              }}
            >
              <Button type="button" onClick={handleAddFeaturedItem} variant="outline" size="sm">
                + Add Another Item
              </Button>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button to="/" target="_blank" rel="noopener noreferrer" variant="ghost" size="sm">
                  Preview on Live Home ↗
                </Button>
                <Button onClick={handleSave} variant="primary" size="sm" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Featured Showcase"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECTIONS */}
        {activeTab === "sections" && (
          <div className="card" style={{ display: "grid", gap: "20px" }}>
            <h2 className="section-title-sm">Home Page Section Headings &amp; Descriptions</h2>

            {/* Featured Work */}
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>SECTION: FEATURED WORK</span>
              <input
                type="text"
                value={sectionHeaders.featuredHeading}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, featuredHeading: e.target.value })}
                className="admin-input"
                placeholder="Featured Work"
              />
              <textarea
                rows={2}
                value={sectionHeaders.featuredDesc}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, featuredDesc: e.target.value })}
                className="admin-textarea"
                placeholder="Highlighting robust full-stack platforms..."
              />
            </div>

            {/* Career Snapshot */}
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: "700" }}>SECTION: CAREER SNAPSHOT</span>
              <input
                type="text"
                value={sectionHeaders.experienceHeading}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, experienceHeading: e.target.value })}
                className="admin-input"
                placeholder="Career Snapshot"
              />
              <textarea
                rows={2}
                value={sectionHeaders.experienceDesc}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, experienceDesc: e.target.value })}
                className="admin-textarea"
                placeholder="Hands-on industry internships..."
              />
            </div>

            {/* Skills & Technologies */}
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-emerald)", fontWeight: "700" }}>SECTION: SKILLS PREVIEW</span>
              <input
                type="text"
                value={sectionHeaders.skillsHeading}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, skillsHeading: e.target.value })}
                className="admin-input"
                placeholder="Skills & Technologies"
              />
              <textarea
                rows={2}
                value={sectionHeaders.skillsDesc}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, skillsDesc: e.target.value })}
                className="admin-textarea"
                placeholder="Curated core stack..."
              />
            </div>

            {/* Education Snapshot */}
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>SECTION: EDUCATION SNAPSHOT</span>
              <input
                type="text"
                value={sectionHeaders.educationHeading}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, educationHeading: e.target.value })}
                className="admin-input"
                placeholder="Education Snapshot"
              />
              <textarea
                rows={2}
                value={sectionHeaders.educationDesc}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, educationDesc: e.target.value })}
                className="admin-textarea"
                placeholder="Specialized postgraduate training in Cloud Computing..."
              />
            </div>

            {/* Milestones & Credentials */}
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: "700" }}>SECTION: ACHIEVEMENTS & MILESTONES</span>
              <input
                type="text"
                value={sectionHeaders.achievementsHeading}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, achievementsHeading: e.target.value })}
                className="admin-input"
                placeholder="Milestones & Credentials"
              />
              <textarea
                rows={2}
                value={sectionHeaders.achievementsDesc}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, achievementsDesc: e.target.value })}
                className="admin-textarea"
                placeholder="Academic selections, industry internships..."
              />
            </div>

            {/* Certifications & Training */}
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-emerald)", fontWeight: "700" }}>SECTION: CERTIFICATIONS & TRAINING</span>
              <input
                type="text"
                value={sectionHeaders.certificationsHeading}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, certificationsHeading: e.target.value })}
                className="admin-input"
                placeholder="Certifications & Training"
              />
              <textarea
                rows={2}
                value={sectionHeaders.certificationsDesc}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, certificationsDesc: e.target.value })}
                className="admin-textarea"
                placeholder="Verified technical credentials..."
              />
            </div>

            {/* Gallery */}
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>SECTION: INTERFACE & DEV GALLERY</span>
              <input
                type="text"
                value={sectionHeaders.galleryHeading}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, galleryHeading: e.target.value })}
                className="admin-input"
                placeholder="Development & Interface Gallery"
              />
              <textarea
                rows={2}
                value={sectionHeaders.galleryDesc}
                onChange={(e) => setSectionHeaders({ ...sectionHeaders, galleryDesc: e.target.value })}
                className="admin-textarea"
                placeholder="Visual inspections, architecture audits..."
              />
            </div>
          </div>
        )}

        {/* TAB 3: PRINCIPLES */}
        {activeTab === "principles" && (
          <div className="card" style={{ display: "grid", gap: "16px" }}>
            <h2 className="section-title-sm">How I Build — Engineering Principles (4 Cards)</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "-8px 0 8px 0" }}>
              These 4 tenets appear near the bottom of the home page, articulating your architectural standards and engineering values.
            </p>

            {principles.map((p, idx) => (
              <div key={idx} style={{ padding: "14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "10px" }}>
                <div className="admin-form-grid-2">
                  <div>
                    <label className="admin-label">PRINCIPLE 0{idx + 1} TITLE</label>
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => {
                        const updated = [...principles];
                        updated[idx].title = e.target.value;
                        setPrinciples(updated);
                      }}
                      className="admin-input"
                      placeholder="e.g. Layered Clean Architecture"
                    />
                  </div>
                  <div>
                    <label className="admin-label">SUBTITLE / PATTERN</label>
                    <input
                      type="text"
                      value={p.subtitle}
                      onChange={(e) => {
                        const updated = [...principles];
                        updated[idx].subtitle = e.target.value;
                        setPrinciples(updated);
                      }}
                      className="admin-input"
                      placeholder="e.g. Controller-Service-Repository Pattern"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={p.desc}
                    onChange={(e) => {
                      const updated = [...principles];
                      updated[idx].desc = e.target.value;
                      setPrinciples(updated);
                    }}
                    className="admin-textarea"
                    placeholder="Describe engineering tenet..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CTA */}
        {activeTab === "cta" && (
          <div className="card" style={{ display: "grid", gap: "16px" }}>
            <h2 className="section-title-sm">Home Contact Call-to-Action Banner</h2>

            <div>
              <label className="admin-label">BANNER HEADING</label>
              <input
                type="text"
                value={contactCta.heading}
                onChange={(e) => setContactCta({ ...contactCta, heading: e.target.value })}
                className="admin-input"
                placeholder="Have a project, opportunity, or idea?"
              />
            </div>

            <div>
              <label className="admin-label">BANNER SUBHEADING / DESCRIPTION</label>
              <textarea
                rows={3}
                value={contactCta.subheading}
                onChange={(e) => setContactCta({ ...contactCta, subheading: e.target.value })}
                className="admin-textarea"
                placeholder="Let's build something reliable and impactful..."
              />
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="admin-label">PRIMARY BUTTON TEXT</label>
                <input
                  type="text"
                  value={contactCta.primaryBtn}
                  onChange={(e) => setContactCta({ ...contactCta, primaryBtn: e.target.value })}
                  className="admin-input"
                  placeholder="Get in Touch →"
                />
              </div>

              <div>
                <label className="admin-label">SECONDARY EMAIL BUTTON TEXT</label>
                <input
                  type="text"
                  value={contactCta.secondaryBtn}
                  onChange={(e) => setContactCta({ ...contactCta, secondaryBtn: e.target.value })}
                  className="admin-input"
                  placeholder="Email Me Directly ↗"
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
          <Button type="submit" variant="primary" size="lg" disabled={isSaving}>
            {isSaving ? "Saving Home Changes..." : "Save Home Page Content"}
          </Button>
          <Button to="/" target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
            Preview Live Home Page ↗
          </Button>
        </div>
      </form>
    </div>
  );
}
