import React, { useState, useEffect } from "react";
import { getProfile, updateProfile, getSettings, updateSettings } from "../../services/dataService";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import { resolveHomeContent } from "../../utils/contentDefaults";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminHomePage() {
  const { refresh } = usePortfolioData();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("hero"); // 'hero' | 'sections' | 'principles' | 'cta'
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
    }
    load();
  }, []);

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

      await Promise.all([
        updateProfile({
          currentRole: hero.currentRole,
          bio: hero.bio,
          availability: hero.availability,
          snapshot: updatedSnapshot
        }),
        updateSettings({
          showAvailabilityBadge: hero.showAvailability
        })
      ]);

      setErrorNotice("");
      if (refresh) await refresh();

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
    <div className="admin-page">
      <SEO title="Home Page Management — Admin CMS" description="Manage homepage hero and section copy." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">CONTENT / HOME</span>
          <h1 className="admin-page-title">Home Page Management</h1>
          <p className="admin-page-desc">
            Full content control center for the primary portfolio landing page: Hero narrative, section titles, engineering principles, and call-to-action blocks.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
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
          { id: "sections", label: "2. Section Headings & Subtitles" },
          { id: "principles", label: "3. How I Build (Principles)" },
          { id: "cta", label: "4. Contact CTA Banner" }
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
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

        {/* TAB 2: SECTIONS */}
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
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
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
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
