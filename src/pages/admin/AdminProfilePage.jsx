import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/dataService";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import { resolveAboutContent } from "../../utils/contentDefaults";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminProfilePage() {
  const { refresh } = usePortfolioData();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("identity"); // 'identity' | 'focus' | 'overview' | 'principles' | 'contact'
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [identity, setIdentity] = useState({
    name: "",
    shortName: "",
    title: "",
    headline: "",
    currentRole: "",
    bio: "",
    location: "",
    availability: ""
  });

  const [snapshot, setSnapshot] = useState({
    currentPosition: "",
    primaryFocus: "",
    backend: "",
    frontend: "",
    cloud: "",
    databases: "",
    academicProgram: "",
    location: "",
    targetRoles: ""
  });

  const [aboutNarrative, setAboutNarrative] = useState({
    introduction: "",
    professionalOverviewStr: "",
    careerDirection: ""
  });

  const [archFocus, setArchFocus] = useState([
    { num: "01", title: "", desc: "" },
    { num: "02", title: "", desc: "" },
    { num: "03", title: "", desc: "" }
  ]);

  const [philosophy, setPhilosophy] = useState([
    { title: "", desc: "" },
    { title: "", desc: "" },
    { title: "", desc: "" }
  ]);

  const [contact, setContact] = useState({
    email: "",
    phone: "",
    whatsapp: "",
    linkedin: "",
    github: "",
    resumeDrive: ""
  });

  useEffect(() => {
    async function load() {
      const p = await getProfile();
      if (!p) return;
      setProfile(p);

      setIdentity({
        name: p.name || "",
        shortName: p.shortName || "",
        title: p.title || "",
        headline: p.headline || "",
        currentRole: p.currentRole || "",
        bio: p.bio || "",
        location: p.location || "Hinjawadi, Pune, Maharashtra, India",
        availability: p.availability || ""
      });

      const s = p.snapshot || {};
      setSnapshot({
        currentPosition: s.currentPosition || p.currentRole || "",
        primaryFocus: s.primaryFocus || "Java Backend & Cloud Computing",
        backend: s.backend || "Java / Spring Boot",
        frontend: s.frontend || "React.js",
        cloud: s.cloud || "Cloud Computing / AWS Fundamentals",
        databases: s.databases || "MySQL / SQL Server / MongoDB",
        academicProgram: s.academicProgram || "MCA — Cloud Computing (D. Y. Patil Pune)",
        location: s.location || p.location || "Hinjawadi, Pune, Maharashtra, India",
        targetRoles: s.targetRoles || "Software Developer · Full Stack Developer · Java Backend Developer"
      });

      const about = resolveAboutContent(p);
      setAboutNarrative({
        introduction: about.introduction || "",
        professionalOverviewStr: Array.isArray(about.professionalOverview) ? about.professionalOverview.join("\n\n") : "",
        careerDirection: about.careerDirection || ""
      });

      setArchFocus(
        Array.isArray(about.architecturalFocus) && about.architecturalFocus.length > 0
          ? about.architecturalFocus
          : [
              { num: "01", title: "Layered Backend Design", desc: "" },
              { num: "02", title: "Relational Integrity & SQL", desc: "" },
              { num: "03", title: "Cloud & Distributed Systems", desc: "" }
            ]
      );

      setPhilosophy(
        Array.isArray(about.philosophy) && about.philosophy.length > 0
          ? about.philosophy
          : [
              { title: "Predictability over Cleverness", desc: "" },
              { title: "Data Integrity First", desc: "" },
              { title: "Zero Fluff, High Performance", desc: "" }
            ]
      );

      setContact({
        email: p.contact?.email || "",
        phone: p.contact?.phone || "",
        whatsapp: p.contact?.whatsapp || "",
        linkedin: p.contact?.linkedin || "",
        github: p.contact?.github || "",
        resumeDrive: p.contact?.resumeDrive || ""
      });
    }
    load();
  }, []);

  const handleSaveAll = async (e) => {
    e?.preventDefault();
    setIsSaving(true);

    try {
      const overviewParagraphs = aboutNarrative.professionalOverviewStr
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const structuredAbout = {
        introduction: aboutNarrative.introduction.trim(),
        professionalOverview: overviewParagraphs,
        architecturalFocus: archFocus,
        philosophy: philosophy,
        careerDirection: aboutNarrative.careerDirection.trim()
      };

      const mergedSnapshot = {
        ...(profile?.snapshot || {}),
        ...snapshot,
        currentPosition: identity.currentRole || snapshot.currentPosition
      };

      const mergedContact = {
        ...(profile?.contact || {}),
        ...contact,
        locationString: identity.location || "Hinjawadi, Pune, Maharashtra, India"
      };

      const payload = {
        ...identity,
        snapshot: mergedSnapshot,
        aboutDetailed: structuredAbout,
        contact: mergedContact
      };

      setErrorNotice("");
      await updateProfile(payload);
      if (refresh) await refresh();

      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setErrorNotice(err.message || "Cloud save failed. Your changes were not saved.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return <div className="admin-page">Loading About / Profile CMS...</div>;

  return (
    <div className="admin-page">
      <SEO title="About &amp; Profile — Admin CMS" description="Manage developer identity and About page content." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">CONTENT / IDENTITY</span>
          <h1 className="admin-page-title">About &amp; Profile Management</h1>
          <p className="admin-page-desc">
            Complete control center for developer biographical data, Developer Snapshot panel, Professional Overview, Architectural Focus, Philosophy, and Contact channels.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button to="/about" target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
            View Live About ↗
          </Button>
          <Button onClick={handleSaveAll} variant="primary" size="sm" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save All Changes"}
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

      {savedNotice && (
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
          ✓ About &amp; Profile changes saved to Supabase and published immediately!
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", marginBottom: "24px" }}>
        {[
          { id: "identity", label: "1. Identity & Bio" },
          { id: "focus", label: "2. Focus & Snapshot" },
          { id: "overview", label: "3. Professional Overview" },
          { id: "principles", label: "4. Architecture & Values" },
          { id: "contact", label: "5. Contact & Socials" }
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

      <form onSubmit={handleSaveAll} style={{ display: "grid", gap: "24px" }}>
        {/* TAB 1: IDENTITY */}
        {activeTab === "identity" && (
          <div className="card" style={{ display: "grid", gap: "16px" }}>
            <h2 className="section-title-sm">Developer Biographical Details</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={identity.name}
                  onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">SHORT / DISPLAY NAME</label>
                <input
                  type="text"
                  value={identity.shortName}
                  onChange={(e) => setIdentity({ ...identity, shortName: e.target.value })}
                  className="admin-input"
                  placeholder="Ayyaj Shaikh"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">PROFESSIONAL TITLE</label>
                <input
                  type="text"
                  required
                  value={identity.title}
                  onChange={(e) => setIdentity({ ...identity, title: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">CURRENT ROLE &amp; COMPANY</label>
                <input
                  type="text"
                  required
                  value={identity.currentRole}
                  onChange={(e) => setIdentity({ ...identity, currentRole: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">HEADLINE / SUPPORTING STACK (HERO PILL BAR)</label>
              <input
                type="text"
                required
                value={identity.headline}
                onChange={(e) => setIdentity({ ...identity, headline: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">SHORT POSITIONING STATEMENT (BIO)</label>
              <textarea
                rows={3}
                required
                value={identity.bio}
                onChange={(e) => setIdentity({ ...identity, bio: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">PUBLIC LOCATION (CITY, STATE, COUNTRY)</label>
                <input
                  type="text"
                  required
                  value={identity.location}
                  onChange={(e) => setIdentity({ ...identity, location: e.target.value })}
                  className="admin-input"
                />
                <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", marginTop: "4px" }}>
                  Note: Never input street or residential numbers here. Public location only.
                </span>
              </div>

              <div>
                <label className="admin-label">AVAILABILITY STATUS</label>
                <input
                  type="text"
                  value={identity.availability}
                  onChange={(e) => setIdentity({ ...identity, availability: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEVELOPER SNAPSHOT */}
        {activeTab === "focus" && (
          <div className="card" style={{ display: "grid", gap: "16px" }}>
            <h2 className="section-title-sm">Developer Focus &amp; Snapshot Grid</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "-8px 0 8px 0" }}>
              These values feed into the &quot;Current Focus&quot; panel on the About page and the compact snapshot strip on the Home page.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">CURRENT ROLE DISPLAY</label>
                <input
                  type="text"
                  value={snapshot.currentPosition}
                  onChange={(e) => setSnapshot({ ...snapshot, currentPosition: e.target.value })}
                  className="admin-input"
                  placeholder="MERN Stack + AI Intern"
                />
              </div>

              <div>
                <label className="admin-label">PRIMARY FOCUS</label>
                <input
                  type="text"
                  value={snapshot.primaryFocus}
                  onChange={(e) => setSnapshot({ ...snapshot, primaryFocus: e.target.value })}
                  className="admin-input"
                  placeholder="Java Backend &amp; Cloud Computing"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">BACKEND STACK</label>
                <input
                  type="text"
                  value={snapshot.backend}
                  onChange={(e) => setSnapshot({ ...snapshot, backend: e.target.value })}
                  className="admin-input"
                  placeholder="Java / Spring Boot"
                />
              </div>

              <div>
                <label className="admin-label">FRONTEND STACK</label>
                <input
                  type="text"
                  value={snapshot.frontend}
                  onChange={(e) => setSnapshot({ ...snapshot, frontend: e.target.value })}
                  className="admin-input"
                  placeholder="React.js"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">CLOUD INFRASTRUCTURE</label>
                <input
                  type="text"
                  value={snapshot.cloud}
                  onChange={(e) => setSnapshot({ ...snapshot, cloud: e.target.value })}
                  className="admin-input"
                  placeholder="Cloud Computing / AWS Fundamentals"
                />
              </div>

              <div>
                <label className="admin-label">DATABASES</label>
                <input
                  type="text"
                  value={snapshot.databases}
                  onChange={(e) => setSnapshot({ ...snapshot, databases: e.target.value })}
                  className="admin-input"
                  placeholder="MySQL / SQL Server / MongoDB"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">ACADEMIC PROGRAM</label>
                <input
                  type="text"
                  value={snapshot.academicProgram}
                  onChange={(e) => setSnapshot({ ...snapshot, academicProgram: e.target.value })}
                  className="admin-input"
                  placeholder="MCA — Cloud Computing (D. Y. Patil Pune)"
                />
              </div>

              <div>
                <label className="admin-label">TARGET ROLES (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  value={snapshot.targetRoles}
                  onChange={(e) => setSnapshot({ ...snapshot, targetRoles: e.target.value })}
                  className="admin-input"
                  placeholder="Software Developer · Full Stack Developer · Java Backend Developer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROFESSIONAL OVERVIEW & NARRATIVE */}
        {activeTab === "overview" && (
          <div className="card" style={{ display: "grid", gap: "16px" }}>
            <h2 className="section-title-sm">Professional Overview &amp; About Narrative</h2>

            <div>
              <label className="admin-label">SHORT PROFESSIONAL INTRODUCTION (ABOUT PAGE TOP HERO CALLOUT)</label>
              <textarea
                rows={3}
                value={aboutNarrative.introduction}
                onChange={(e) => setAboutNarrative({ ...aboutNarrative, introduction: e.target.value })}
                className="admin-textarea"
                placeholder="I am Ayyaj Kalandar Shaikh, a software developer..."
              />
            </div>

            <div>
              <label className="admin-label">
                PROFESSIONAL OVERVIEW (PARAGRAPHS SEPARATED BY DOUBLE ENTER)
              </label>
              <textarea
                rows={8}
                value={aboutNarrative.professionalOverviewStr}
                onChange={(e) => setAboutNarrative({ ...aboutNarrative, professionalOverviewStr: e.target.value })}
                className="admin-textarea"
                placeholder="Paragraph 1 (MCA studies and theoretical base)...&#10;&#10;Paragraph 2 (Internship at BQARLSON)...&#10;&#10;Paragraph 3 (BCA foundation at Sangameshwar College)..."
              />
              <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", marginTop: "4px" }}>
                Tip: Each blank line between paragraphs creates a clean separate paragraph on the public About page.
              </span>
            </div>

            <div>
              <label className="admin-label">CAREER DIRECTION &amp; POST-GRADUATE GOALS</label>
              <textarea
                rows={3}
                value={aboutNarrative.careerDirection}
                onChange={(e) => setAboutNarrative({ ...aboutNarrative, careerDirection: e.target.value })}
                className="admin-textarea"
                placeholder="I am preparing for full-time engineering roles upon completion of my postgraduate degree..."
              />
            </div>
          </div>
        )}

        {/* TAB 4: ARCHITECTURE & VALUES */}
        {activeTab === "principles" && (
          <div style={{ display: "grid", gap: "24px" }}>
            {/* Architectural Focus Cards */}
            <div className="card" style={{ display: "grid", gap: "16px" }}>
              <h2 className="section-title-sm">Core Architectural Focus (3 Principles on About Page)</h2>

              {archFocus.map((arch, idx) => (
                <div key={idx} style={{ padding: "14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "10px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "12px" }}>
                    <div>
                      <label className="admin-label">NUMBER</label>
                      <input
                        type="text"
                        value={arch.num || `0${idx + 1}`}
                        onChange={(e) => {
                          const updated = [...archFocus];
                          updated[idx].num = e.target.value;
                          setArchFocus(updated);
                        }}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">PRINCIPLE TITLE</label>
                      <input
                        type="text"
                        value={arch.title}
                        onChange={(e) => {
                          const updated = [...archFocus];
                          updated[idx].title = e.target.value;
                          setArchFocus(updated);
                        }}
                        className="admin-input"
                        placeholder="e.g. Layered Backend Design"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">DESCRIPTION</label>
                    <textarea
                      rows={2}
                      value={arch.desc}
                      onChange={(e) => {
                        const updated = [...archFocus];
                        updated[idx].desc = e.target.value;
                        setArchFocus(updated);
                      }}
                      className="admin-textarea"
                      placeholder="Explain design principle..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Development Philosophy Tenets */}
            <div className="card" style={{ display: "grid", gap: "16px" }}>
              <h2 className="section-title-sm">Development Philosophy (Engineering Values)</h2>

              {philosophy.map((item, idx) => (
                <div key={idx} style={{ padding: "14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "grid", gap: "10px" }}>
                  <div>
                    <label className="admin-label">TENET TITLE</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...philosophy];
                        updated[idx].title = e.target.value;
                        setPhilosophy(updated);
                      }}
                      className="admin-input"
                      placeholder="e.g. Predictability over Cleverness"
                    />
                  </div>
                  <div>
                    <label className="admin-label">DESCRIPTION</label>
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) => {
                        const updated = [...philosophy];
                        updated[idx].desc = e.target.value;
                        setPhilosophy(updated);
                      }}
                      className="admin-textarea"
                      placeholder="Explain engineering tenet..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT & SOCIALS */}
        {activeTab === "contact" && (
          <div className="card" style={{ display: "grid", gap: "16px" }}>
            <h2 className="section-title-sm">Contact Channels &amp; Social Links</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">PHONE NUMBER (PUBLIC)</label>
                <input
                  type="text"
                  required
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">LINKEDIN URL</label>
                <input
                  type="url"
                  value={contact.linkedin}
                  onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">GITHUB PROFILE URL</label>
                <input
                  type="url"
                  value={contact.github}
                  onChange={(e) => setContact({ ...contact, github: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">WHATSAPP LINK (wa.me/number)</label>
                <input
                  type="url"
                  value={contact.whatsapp}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">GOOGLE DRIVE RESUME LINK</label>
                <input
                  type="url"
                  value={contact.resumeDrive}
                  onChange={(e) => setContact({ ...contact, resumeDrive: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <Button type="submit" variant="primary" size="lg" disabled={isSaving}>
            {isSaving ? "Saving All Content to Supabase..." : "Save About &amp; Profile Changes"}
          </Button>
          <Button to="/about" target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
            Preview Live About Page ↗
          </Button>
        </div>
      </form>
    </div>
  );
}
