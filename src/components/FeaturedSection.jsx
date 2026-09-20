import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import ProjectThumbnail from "./ProjectThumbnail";
import Button from "./Button";

export const defaultFeaturedItems = [
  {
    id: "feat-nexora",
    type: "project",
    contentId: "nexora",
    badge: "Flagship Platform",
    tagline: "Autonomous workflow execution, real-time logging, and distributed microservices architecture.",
    enabled: true,
    sortOrder: 1
  },
  {
    id: "feat-mern-training",
    type: "certification",
    contentId: "mern-stack-ai-cert",
    badge: "Industry Credential",
    fallbackTitle: "MERN Stack + AI Practical Development Training",
    fallbackIssuer: "BQARLSON Software Pvt. Ltd.",
    fallbackSkills: ["React.js", "Node.js", "Express.js", "MongoDB", "AI APIs"],
    tagline: "Hands-on engineering focusing on enterprise MERN stack development and Generative AI API integrations.",
    enabled: true,
    sortOrder: 2
  },
  {
    id: "feat-azure-devops",
    type: "certification",
    contentId: "azure-devops-cert",
    badge: "Cloud & DevOps",
    fallbackTitle: "Mastering Azure DevOps: From Beginner to Advanced 2026",
    fallbackIssuer: "Udemy / Uday Academy",
    fallbackSkills: ["Azure DevOps", "CI/CD Pipelines", "Docker", "Artifacts", "Cloud Deployments"],
    tagline: "End-to-end automated build & release pipelines, infrastructure as code, and cloud lifecycle orchestration.",
    enabled: true,
    sortOrder: 3
  }
];

export default function FeaturedSection({ heading, description }) {
  const {
    settings,
    profile,
    projects = [],
    certifications = [],
    gallery = [],
    experience = [],
    achievements = []
  } = usePortfolioData();

  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (e, credId, itemId) => {
    e.stopPropagation();
    if (!credId) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(credId);
    }
    setCopiedId(itemId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Resolve active items from settings or profile snapshot fallback
  let rawItems = [];
  if (Array.isArray(settings?.featuredItems)) {
    rawItems = settings.featuredItems;
  } else if (Array.isArray(profile?.snapshot?.home?.featuredItems)) {
    rawItems = profile.snapshot.home.featuredItems;
  } else {
    rawItems = defaultFeaturedItems;
  }

  const activeItems = (Array.isArray(rawItems) ? rawItems : [])
    .filter((item) => item && item.enabled !== false && Boolean(item.contentId))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (activeItems.length === 0) {
    return null;
  }

  const gridLayoutClass =
    activeItems.length === 1
      ? "has-1-item"
      : activeItems.length === 2
      ? "has-2-items"
      : "has-3-or-more";

  return (
    <section className="home-section" id="projects" aria-label="Featured Showcase">
      <div className="home-section-header">
        <div>
          <span className="section-micro-label">CURATED SHOWCASE</span>
          <h2 className="home-section-title">
            {heading || "Featured Work"}
          </h2>
          <p className="home-section-desc">
            {description || "Selected flagship projects, verified industry credentials, and visual architecture highlights."}
          </p>
        </div>
      </div>

      <div className={`featured-cards-grid ${gridLayoutClass}`}>
        {activeItems.map((item, idx) => {
          const indexNum = `#0${idx + 1}`;

          // ── Case 1: PROJECT ──────────────────────────────────────
          if (item.type === "project") {
            const proj = (projects || []).find(
              (p) => p && (p.slug === item.contentId || p.id === item.contentId)
            );

            if (!proj) {
              return null; // Gracefully skip if referenced project does not exist
            }

            return (
              <article key={item.id || `feat-${idx}`} className="featured-project-card">
                <Link
                  to={`/projects/${proj.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ display: "block", marginBottom: "14px" }}
                >
                  <ProjectThumbnail project={proj} />
                </Link>

                <div className="featured-card-top">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className="featured-index">{indexNum}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: "rgba(56, 189, 248, 0.15)",
                        color: "var(--accent-cyan)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {item.badge || "PROJECT"}
                    </span>
                  </div>

                  <span
                    className={`project-status ${(proj.status || "").toLowerCase().includes("dev") ? "in-development" : "completed"}`}
                  >
                    {proj.status || "Completed"}
                  </span>
                </div>

                <div className="featured-card-meta">{proj.type || "Full-Stack Project"}</div>
                <h3 className="featured-card-title">
                  <Link to={`/projects/${proj.slug}`}>{proj.title}</Link>
                </h3>

                <div className="featured-card-stack">{proj.stack}</div>

                <p className="featured-card-desc">
                  {item.tagline || proj.description || proj.shortDescription}
                </p>

                <div className="featured-tag-cloud" style={{ marginBottom: "16px" }}>
                  {(proj.technologies || []).slice(0, 4).map((t) => (
                    <span key={t} className="featured-mini-tag">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="featured-card-actions">
                  <Button to={`/projects/${proj.slug}`} variant="outline" size="sm">
                    Explore Case Study →
                  </Button>
                  {proj.github && (
                    <Button
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="ghost"
                      size="sm"
                    >
                      GitHub ↗
                    </Button>
                  )}
                </div>
              </article>
            );
          }

          // ── Case 2: CERTIFICATION ────────────────────────────────
          if (item.type === "certification") {
            const cert = (certifications || []).find(
              (c) =>
                c &&
                (c.id === item.contentId ||
                  c.credentialId === item.contentId ||
                  (c.name && c.name.toLowerCase().includes((item.contentId || "").toLowerCase())) ||
                  (c.title && c.title.toLowerCase().includes((item.contentId || "").toLowerCase())))
            );

            const title = cert?.name || cert?.title || item.fallbackTitle || "Technical Certification";
            const issuer = cert?.issuer || item.fallbackIssuer || "Verified Issuing Authority";
            const date = cert?.date || "2026";
            const desc = item.tagline || cert?.description || "Verified industry qualification testing production architecture and practical engineering.";
            const skills = cert?.skills || item.fallbackSkills || [];
            const verificationUrl = cert?.verificationUrl || cert?.certificateUrl;
            const credId = cert?.credentialId;
            const certImage = cert?.image || (cert?.certificateUrl && /\.(png|jpe?g|webp|gif|svg)$/i.test(cert.certificateUrl) ? cert.certificateUrl : null);
            const isCopied = copiedId === (item.id || idx);

            return (
              <article key={item.id || `feat-${idx}`} className="featured-project-card">
                {/* Visual Thumbnail: Image or Designed Credential Certificate Panel */}
                <div className="showcase-thumb-panel" style={{ marginBottom: "14px" }}>
                  {certImage ? (
                    <img
                      src={certImage}
                      alt={title}
                      loading="lazy"
                      decoding="async"
                      className="showcase-thumb-img"
                    />
                  ) : (
                    <div className="credential-preview-panel">
                      <div className="credential-preview-top">
                        <span className="credential-preview-badge">VERIFIED CREDENTIAL</span>
                        <span className="credential-preview-status">● VERIFIED</span>
                      </div>
                      <div className="credential-preview-body">
                        <div className="credential-seal-icon">📜</div>
                        <div className="credential-preview-info">
                          <div className="credential-preview-name" title={title}>{title}</div>
                          <div className="credential-preview-issuer">{issuer}</div>
                        </div>
                      </div>
                      <div className="credential-preview-footer">
                        <span>{credId ? `ID: ${credId.slice(0, 16)}...` : "TECHNICAL EVALUATION"}</span>
                        <span>{date}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="featured-card-top">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className="featured-index">{indexNum}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: "rgba(245, 158, 11, 0.15)",
                        color: "var(--accent-amber)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {item.badge || "CREDENTIAL"}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--accent-emerald)",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    ● Verified
                  </span>
                </div>

                <div className="featured-card-meta">{issuer} · {date}</div>
                <h3 className="featured-card-title">
                  {title}
                </h3>

                <div className="featured-card-stack">Verified Technical Competency</div>

                <p className="featured-card-desc">{desc}</p>

                {skills.length > 0 && (
                  <div className="featured-tag-cloud" style={{ marginBottom: "16px" }}>
                    {skills.slice(0, 4).map((s) => (
                      <span key={s} className="featured-mini-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {credId && (
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "8px 10px",
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "4px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      width: "100%",
                      minWidth: 0,
                      boxSizing: "border-box"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "10.5px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                        Credential ID
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyId(e, credId, item.id || idx)}
                        style={{
                          background: isCopied ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                          border: isCopied ? "1px solid var(--accent-emerald)" : "1px solid var(--border-subtle)",
                          borderRadius: "3px",
                          color: isCopied ? "var(--accent-emerald)" : "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "10px",
                          padding: "2px 6px"
                        }}
                      >
                        {isCopied ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text-main)",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word"
                      }}
                    >
                      {credId}
                    </span>
                  </div>
                )}

                <div className="featured-card-actions">
                  {verificationUrl ? (
                    <Button href={verificationUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
                      Verify Credential ↗
                    </Button>
                  ) : (
                    <Button to="/certifications" variant="outline" size="sm">
                      View Certificate →
                    </Button>
                  )}
                </div>
              </article>
            );
          }

          // ── Case 3: GALLERY ──────────────────────────────────────
          if (item.type === "gallery") {
            const gal = (gallery || []).find(
              (g) =>
                g &&
                (g.id === item.contentId ||
                  g.slug === item.contentId ||
                  (g.title && g.title.toLowerCase().includes((item.contentId || "").toLowerCase())))
            );

            if (!gal) return null;

            const galImage = gal.src || gal.thumbnail || gal.imageUrl || null;

            return (
              <article key={item.id || `feat-${idx}`} className="featured-project-card">
                {/* Visual Thumbnail: Image or Designed Visual Fallback */}
                <div className="showcase-thumb-panel" style={{ marginBottom: "14px" }}>
                  {galImage ? (
                    <img
                      src={galImage}
                      alt={gal.title}
                      loading="lazy"
                      decoding="async"
                      className="showcase-thumb-img"
                    />
                  ) : (
                    <div className="gallery-preview-panel">
                      <div className="credential-preview-top">
                        <span className="gallery-preview-badge">VISUAL SHOWCASE</span>
                        <span style={{ fontSize: "10px", color: "#c084fc", fontWeight: "600", fontFamily: "var(--font-mono)" }}>
                          📷 {gal.category || "MEDIA"}
                        </span>
                      </div>
                      <div className="credential-preview-body">
                        <div style={{ fontSize: "28px", lineHeight: "1", flexShrink: 0 }}>🎨</div>
                        <div className="credential-preview-info">
                          <div className="credential-preview-name" title={gal.title}>{gal.title}</div>
                          <div style={{ fontSize: "11.5px", color: "var(--accent-cyan)" }}>
                            {gal.category || "Interface & Architecture"}
                          </div>
                        </div>
                      </div>
                      <div className="credential-preview-footer">
                        <span>MEDIA ARCHITECTURE</span>
                        <span>{gal.date || "2026"}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="featured-card-top">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className="featured-index">{indexNum}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: "rgba(168, 85, 247, 0.15)",
                        color: "#c084fc",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {item.badge || "GALLERY"}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--accent-cyan)",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    📷 {gal.category || "Visual"}
                  </span>
                </div>

                <div className="featured-card-meta">{gal.category || "Media"} · {gal.date || "2026"}</div>
                <h3 className="featured-card-title">
                  <Link to="/gallery">{gal.title}</Link>
                </h3>

                <div className="featured-card-stack">{gal.category || "Visual"} Media &amp; Architecture Showcase</div>

                <p className="featured-card-desc">
                  {item.tagline || gal.caption || "High-resolution architectural and interface verification capture."}
                </p>

                <div className="featured-card-actions">
                  <Button to="/gallery" variant="outline" size="sm">
                    View Gallery →
                  </Button>
                </div>
              </article>
            );
          }

          // ── Case 4: ACHIEVEMENT ──────────────────────────────────
          if (item.type === "achievement") {
            const ach = (achievements || []).find(
              (a) =>
                a &&
                (a.id === item.contentId ||
                  a.slug === item.contentId ||
                  (a.title && a.title.toLowerCase().includes((item.contentId || "").toLowerCase())))
            );

            if (!ach) return null;

            return (
              <article key={item.id || `feat-${idx}`} className="featured-project-card">
                {/* Visual Thumbnail: Image or Designed Achievement Panel */}
                <div className="showcase-thumb-panel" style={{ marginBottom: "14px" }}>
                  {ach.image ? (
                    <img
                      src={ach.image}
                      alt={ach.title}
                      loading="lazy"
                      decoding="async"
                      className="showcase-thumb-img"
                    />
                  ) : (
                    <div className="achievement-preview-panel">
                      <div className="achievement-preview-top">
                        <span className="achievement-preview-badge">{ach.type || "MILESTONE"}</span>
                        <span style={{ fontSize: "10px", color: "var(--accent-amber)", fontWeight: "600", fontFamily: "var(--font-mono)" }}>
                          ★ HONORS
                        </span>
                      </div>
                      <div className="achievement-preview-body">
                        <div className="achievement-seal-icon">🏆</div>
                        <div className="achievement-preview-info">
                          <div className="achievement-preview-name" title={ach.title}>{ach.title}</div>
                          <div className="achievement-preview-org">{ach.organization}</div>
                        </div>
                      </div>
                      <div className="achievement-preview-footer">
                        <span>SELECTION &amp; MERIT</span>
                        <span>{ach.date}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="featured-card-top">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className="featured-index">{indexNum}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: "rgba(245, 158, 11, 0.15)",
                        color: "var(--accent-amber)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {item.badge || "ACHIEVEMENT"}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--accent-amber)",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    ★ Milestone
                  </span>
                </div>

                <div className="featured-card-meta">{ach.organization} · {ach.date}</div>
                <h3 className="featured-card-title">
                  <Link to="/achievements">{ach.title}</Link>
                </h3>

                <div className="featured-card-stack">{ach.type || "Academic Milestone"}</div>

                <p className="featured-card-desc">
                  {item.tagline || ach.description || ach.impact}
                </p>

                {(ach.highlights || []).length > 0 && (
                  <div className="featured-tag-cloud" style={{ marginBottom: "16px" }}>
                    {ach.highlights.slice(0, 3).map((h, hIdx) => (
                      <span key={hIdx} className="featured-mini-tag">
                        {h.split(" ").slice(0, 3).join(" ")}
                      </span>
                    ))}
                  </div>
                )}

                <div className="featured-card-actions">
                  <Button to="/achievements" variant="outline" size="sm">
                    View Achievement →
                  </Button>
                </div>
              </article>
            );
          }

          // ── Case 4: EXPERIENCE ───────────────────────────────────
          if (item.type === "experience") {
            const exp = (experience || []).find(
              (e) =>
                e &&
                (e.id === item.contentId ||
                  (e.company && e.company.toLowerCase().includes((item.contentId || "").toLowerCase())))
            );

            if (!exp) return null;

            return (
              <article key={item.id || `feat-${idx}`} className="featured-project-card">
                {/* Visual Thumbnail: Designed Experience Spotlight Panel */}
                <div className="showcase-thumb-panel" style={{ marginBottom: "14px" }}>
                  <div className="experience-preview-panel">
                    <div className="credential-preview-top">
                      <span className="experience-preview-badge">CAREER SPOTLIGHT</span>
                      <span style={{ fontSize: "10px", color: "#c084fc", fontWeight: "600", fontFamily: "var(--font-mono)" }}>
                        {exp.employmentType || "Professional"}
                      </span>
                    </div>
                    <div className="credential-preview-body">
                      <div style={{ fontSize: "28px", lineHeight: "1", flexShrink: 0 }}>💼</div>
                      <div className="credential-preview-info">
                        <div className="credential-preview-name" title={exp.role}>{exp.role}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--accent-cyan)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {exp.company}
                        </div>
                      </div>
                    </div>
                    <div className="credential-preview-footer">
                      <span>{exp.location}</span>
                      <span>{exp.startDate} – {exp.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="featured-card-top">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className="featured-index">{indexNum}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: "rgba(168, 85, 247, 0.15)",
                        color: "#c084fc",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {item.badge || "EXPERIENCE"}
                    </span>
                  </div>

                  {exp.current && (
                    <span className="project-status in-development">
                      ● Active Role
                    </span>
                  )}
                </div>

                <div className="featured-card-meta">{exp.company} · {exp.location}</div>
                <h3 className="featured-card-title">
                  <Link to="/experience">{exp.role}</Link>
                </h3>

                <div className="featured-card-stack">{exp.employmentType}</div>

                <p className="featured-card-desc">
                  {item.tagline || exp.description}
                </p>

                {(exp.technologies || []).length > 0 && (
                  <div className="featured-tag-cloud" style={{ marginBottom: "16px" }}>
                    {exp.technologies.slice(0, 4).map((t) => (
                      <span key={t} className="featured-mini-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="featured-card-actions">
                  <Button to="/experience" variant="outline" size="sm">
                    View Experience →
                  </Button>
                </div>
              </article>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}
