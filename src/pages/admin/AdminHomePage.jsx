import React, { useState, useEffect } from "react";
import { getProfile, updateProfile, getSettings, updateSettings } from "../../services/dataService";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import { resolveHomeContent } from "../../utils/contentDefaults";
import { defaultFeaturedItems } from "../../components/FeaturedSection";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export function getDerivedCtaLabel(item) {
  if (!item || !item.type) return "View Details →";
  switch (item.type) {
    case "project":
      return "Explore Case Study →";
    case "certification":
      return "View Certificate →";
    case "achievement":
      return "View Achievement →";
    case "experience":
      return "View Experience →";
    default:
      return "View Details →";
  }
}

export default function AdminHomePage() {
  const {
    refresh,
    projects = [],
    certifications = [],
    experience = [],
    achievements = []
  } = usePortfolioData();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("hero"); // 'hero' | 'featured' | 'sections' | 'principles' | 'cta'
  const [featuredList, setFeaturedList] = useState([]);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      const feats = Array.isArray(s?.featuredItems) && s.featuredItems.length > 0
        ? s.featuredItems
        : defaultFeaturedItems;
      setFeaturedList(feats);
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
      enabled: false,
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
      if (refresh) await refresh();

      if (savedSettings?.__featuredItemsPendingMigration) {
        setNotice("✓ Saved to Supabase! (Note: Run migration 20260917000000_featured_and_gallery_sort.sql in Supabase SQL editor to persist featured_items permanently).");
        setTimeout(() => setNotice(""), 6000);
      } else {
        setNotice("✓ Home page configuration and content successfully saved to Supabase!");
        setTimeout(() => setNotice(""), 3500);
      }
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
                <span className="section-micro-label" style={{ color: "var(--accent-amber)" }}>HOMEPAGE CONTENT &gt; FEATURED SHOWCASE</span>
                <h2 className="section-title-sm" style={{ margin: "4px 0 6px" }}>Featured Showcase Curator</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
                  Select and arrange the flagship projects, verified credentials, and experience spotlights displayed in the home page showcase grid.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <Button type="button" onClick={handleAddFeaturedItem} variant="primary" size="sm">
                  + Add Featured Item
                </Button>
              </div>
            </div>

            {/* List of Featured Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", minWidth: 0 }}>
              {featuredList.map((item, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === featuredList.length - 1;
                const isUnconfigured = !item.contentId;

                return (
                  <div
                    key={item.id || idx}
                    id={item.id}
                    className={`admin-featured-card ${item.isNew || isUnconfigured ? "is-new" : ""}`}
                  >
                    {/* 1. Header: Order controls, Title / Status, Active toggle, Delete */}
                    <div className="admin-featured-card-header">
                      <div className="admin-featured-card-title-group">
                        <span style={{ fontSize: "12px", color: "var(--accent-amber)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                          #{String(idx + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-bright)", textTransform: "capitalize" }}>
                          {item.type || "Custom"} Spotlight
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
                            NEW / UNLINKED
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
                            ▲ Up
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
                            ▼ Down
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeaturedItem(idx)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: "#f87171", padding: "4px 8px", fontSize: "11px" }}
                          aria-label={`Delete item ${idx + 1}`}
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
                                contentId: ""
                              });
                            }}
                          >
                            <option value="">-- Select Content Type --</option>
                            <option value="project">Project</option>
                            <option value="certification">Certification / Training</option>
                            <option value="experience">Experience Spotlight</option>
                            <option value="achievement">Achievement / Milestone</option>
                          </select>
                        </div>

                        <div>
                          <label className="admin-label">LINKED ENTITY</label>
                          {!item.type && (
                            <select className="admin-input" disabled value="">
                              <option value="">-- Select content type first --</option>
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
                        </div>
                      </div>
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
              })}
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
