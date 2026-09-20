import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import Button from "./Button";
import SEO from "./SEO";
import { scrollToTarget } from "../utils/scrollUtils";
import { fetchActiveResumeVersion, logAnalyticsEvent } from "../services/supabaseService";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { resolveJarvisQuery } from "../services/jarvisIntelligenceService";

export default function RecruiterHomeView() {
  const store = usePortfolioData();
  const {
    profile: profileData,
    recruiter: recruiterProfile,
    projects: allProjects = [],
    featuredProjects = [],
    experience: experienceData = [],
    education: educationData = []
  } = store;

  // Active resume state
  const [activeResume, setActiveResume] = useState(null);

  // Dynamic project filtering & search state
  const [selectedTech, setSelectedTech] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state (responsive: 3 desktop, 2 tablet, 1 mobile)
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Responsive page size updates
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const nextSize = w < 640 ? 1 : w < 1024 ? 2 : 3;
      setPageSize(nextSize);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Contextual ASK JARVIS state
  const [jarvisQuery, setJarvisQuery] = useState("");
  const [jarvisResponse, setJarvisResponse] = useState(null);
  const [jarvisLoading, setJarvisLoading] = useState(false);

  // Suggested recruiter questions
  const SUGGESTED_QUESTIONS = [
    "What is Ayyaj's primary tech stack?",
    "Tell me about his Java & Spring Boot experience",
    "Where is he located and available to join?",
    "What are his top full stack projects?",
    "Summarize his qualifications for hiring"
  ];

  // Fetch active resume & log initial recruiter visit
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchActiveResumeVersion().then((v) => {
        if (v?.public_url || v?.file_url) setActiveResume(v);
      });
    }
    logAnalyticsEvent("recruiter_mode_visit", "/recruiter/overview", {});
    logAnalyticsEvent("page_view", "/recruiter/overview", {});
  }, []);

  // Pre-populate initial JARVIS recruiter briefing
  useEffect(() => {
    if (!jarvisResponse && store?.profile) {
      const initial = resolveJarvisQuery("Summarize his qualifications for hiring", store);
      setJarvisResponse(initial);
    }
  }, [store, jarvisResponse]);

  // Handle JARVIS query execution
  const handleRunJarvisQuery = useCallback(
    (qText) => {
      const queryToRun = (qText || jarvisQuery || "").trim();
      if (!queryToRun) return;
      setJarvisLoading(true);
      try {
        const result = resolveJarvisQuery(queryToRun, store);
        setJarvisResponse(result);
        logAnalyticsEvent("jarvis_query", "/recruiter/overview", {
          query: queryToRun,
          intent: result.intent
        });
      } catch (err) {
        console.error("Recruiter JARVIS error:", err);
      } finally {
        setJarvisLoading(false);
      }
    },
    [jarvisQuery, store]
  );

  // Compute dynamic technology filter pills from existing projects
  const availableTechnologies = useMemo(() => {
    const techSet = new Set();
    const presets = ["Java", "React", "Full Stack", "Spring Boot", "MySQL", "ASP.NET Core"];

    allProjects.forEach((p) => {
      if (Array.isArray(p.technologies)) {
        p.technologies.forEach((t) => techSet.add(t));
      }
      if (Array.isArray(p.category)) {
        p.category.forEach((c) => techSet.add(c));
      }
    });

    const ordered = ["All"];
    presets.forEach((preset) => {
      const match = allProjects.some((p) => {
        const str = [
          p.title,
          p.type,
          p.stack,
          ...(p.technologies || []),
          ...(p.category || [])
        ].join(" ").toLowerCase();
        return str.includes(preset.toLowerCase());
      });
      if (match && !ordered.includes(preset)) {
        ordered.push(preset);
      }
    });

    return ordered;
  }, [allProjects]);

  // Real-time client-side filtered projects
  const filteredProjects = useMemo(() => {
    const list = allProjects.length > 0 ? allProjects : featuredProjects;
    return list.filter((p) => {
      // 1. Tech / Category filter
      if (selectedTech !== "All") {
        const target = selectedTech.toLowerCase();
        const techMatch = [
          p.title,
          p.type,
          p.stack,
          ...(p.technologies || []),
          ...(p.category || [])
        ].some((item) => {
          if (!item) return false;
          if (target === "java") {
            return /\bjava\b/i.test(item) && !/\bjavascript\b/i.test(item);
          }
          return item.toLowerCase().includes(target);
        });
        if (!techMatch) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchable = [
          p.title,
          p.type,
          p.description,
          p.problem,
          p.solution,
          p.stack,
          ...(p.technologies || []),
          ...(p.features || [])
        ].join(" ").toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [allProjects, featuredProjects, selectedTech, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProjects = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, safeCurrentPage, pageSize]);

  // Handle filter selection with telemetry & page reset
  const handleFilterSelect = (tech) => {
    setSelectedTech(tech);
    setCurrentPage(1);
    logAnalyticsEvent("recruiter_filter_used", "/recruiter/overview", {
      filter: tech,
      search: searchQuery
    });
  };

  // Handle search input change with telemetry & page reset
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setCurrentPage(1);
    if (val.length >= 3) {
      logAnalyticsEvent("recruiter_filter_used", "/recruiter/overview", {
        filter: selectedTech,
        search: val
      });
    }
  };

  if (!profileData || !recruiterProfile) return null;

  // Resolve active resume URL & filename
  const resolvedResumeUrl =
    activeResume?.public_url ||
    activeResume?.file_url ||
    profileData.contact?.resumePdf ||
    "/Ayyaj Kalandar Shaikh - Resume.pdf";

  const resolvedResumeName =
    activeResume?.file_name ||
    profileData.contact?.resumePdfName ||
    "Ayyaj Kalandar Shaikh - Resume.pdf";

  const pdfUrl = resolvedResumeUrl.startsWith("http")
    ? resolvedResumeUrl
    : `/${encodeURIComponent(resolvedResumeUrl)}`;

  // Categorized core skills derived strictly from CMS skillsData
  const rawSkills = store.skills || [];
  const frontendCategory = rawSkills.find((c) => c.category?.includes("FRONTEND"))?.skills || [
    { name: "React.js", core: true },
    { name: "JavaScript (ES6+)", core: true },
    { name: "HTML5" },
    { name: "CSS3" },
    { name: "Bootstrap" },
    { name: "Responsive Design" }
  ];

  const backendCategory = [
    ...(rawSkills.find((c) => c.category?.includes("CORE BACKEND"))?.skills || [
      { name: "Java", core: true },
      { name: "Spring Boot", core: true },
      { name: "REST APIs", core: true },
      { name: "Hibernate / JPA", core: true }
    ]),
    ...(rawSkills.find((c) => c.category?.includes("ADDITIONAL BACKEND"))?.skills || [
      { name: "ASP.NET Core" },
      { name: "C#" }
    ])
  ];

  const databaseCategory = rawSkills.find((c) => c.category?.includes("DATABASES"))?.skills || [
    { name: "MySQL", core: true },
    { name: "SQL Server (SSMS)" },
    { name: "MongoDB" },
    { name: "Database Normalization" }
  ];

  const cloudCategory = [
    ...(rawSkills.find((c) => c.category?.includes("CLOUD"))?.skills || [
      { name: "Cloud Computing Fundamentals" },
      { name: "AWS Fundamentals" }
    ]),
    ...(rawSkills.find((c) => c.category?.includes("TOOLS"))?.skills || [
      { name: "Git" },
      { name: "Postman" },
      { name: "Maven" }
    ])
  ];

  return (
    <div className="recruiter-view" aria-label="Executive Recruiter Briefing">
      <SEO
        title="Recruiter Overview"
        description="Recruiter & hiring manager overview for Ayyaj Kalandar Shaikh — Software Developer specializing in Java, Spring Boot, React.js, and Cloud Computing."
      />

      {/* ─────────────────────────────────────────────────────────────
          QUICK NAVIGATION — COMPACT RESPONSIVE TILES
          ───────────────────────────────────────────────────────────── */}
      <section className="card recruiter-jump-card" aria-label="Quick Navigation">
        <div className="recruiter-jump-header">
          <span className="section-micro-label">QUICK NAVIGATION</span>
        </div>

        <div className="recruiter-jump-grid">
          <a
            href="#snapshot"
            className="recruiter-jump-btn"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("snapshot", true);
            }}
          >
            Career
          </a>
          <a
            href="#skills"
            className="recruiter-jump-btn"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("skills", true);
            }}
          >
            Core Stack
          </a>
          <a
            href="#projects"
            className="recruiter-jump-btn"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("projects", true);
            }}
          >
            Projects
          </a>
          <a
            href="#experience"
            className="recruiter-jump-btn"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("experience", true);
            }}
          >
            Experience
          </a>
          <a
            href="#education"
            className="recruiter-jump-btn"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("education", true);
            }}
          >
            Education
          </a>
          <a
            href="#jarvis"
            className="recruiter-jump-btn"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("jarvis", true);
            }}
          >
            Ask JARVIS
          </a>
          <a
            href="#contact"
            className="recruiter-jump-btn recruiter-jump-btn-featured"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("contact", true);
            }}
          >
            Interview ✉
          </a>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          1. HERO / CANDIDATE OVERVIEW CARD (#overview)
          ───────────────────────────────────────────────────────────── */}
      <section className="card recruiter-hero-card" id="overview" style={{ marginBottom: "28px" }}>
        <div className="recruiter-hero-top">
          <div>
            <div className="recruiter-badge-group">
              <span className="recruiter-status-pill">
                <span className="mode-dot" aria-hidden="true" />
                {profileData.currentRole || "MERN Stack + AI Intern @ BQARLSON Software Pvt. Ltd."}
              </span>
              <span className="recruiter-loc-pill">
                📍 {profileData.location || "Hinjawadi, Pune, Maharashtra, India"}
              </span>
              <span className="recruiter-avail-pill">
                ✓ Immediate Notice-Free Availability
              </span>
            </div>
            <h1 className="recruiter-name">{profileData.name}</h1>
            <div className="recruiter-title">{profileData.title}</div>
            <div className="recruiter-stack">{profileData.headline}</div>
          </div>

          <div className="recruiter-photo-box">
            <img
              src="/profile.jpg"
              alt={profileData.name}
              width="120"
              height="120"
              decoding="async"
              className="recruiter-photo"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect fill='%23141a24' width='120' height='120'/%3E%3Ctext fill='%2338bdf8' font-family='monospace' font-size='32' font-weight='bold' x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle'%3EAK%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Executive Pitch */}
        <div className="recruiter-summary-box">
          <div className="section-micro-label">CANDIDATE SUMMARY</div>
          <p className="recruiter-summary-text">{recruiterProfile.summary}</p>
          {Array.isArray(recruiterProfile.highlights) && recruiterProfile.highlights.length > 0 && (
            <ul className="recruiter-pitch-highlights">
              {recruiterProfile.highlights.map((item, idx) => (
                <li key={idx}>✓ {item}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Primary Action Row for Recruiters */}
        <div className="recruiter-actions-row">
          <Button
            to="/resume"
            variant="primary"
            onClick={() => logAnalyticsEvent("resume_view", "/recruiter/overview", { source: "hero" })}
          >
            View Resume 📄
          </Button>
          <Button
            href={pdfUrl}
            download={resolvedResumeName}
            variant="outline"
            onClick={() => logAnalyticsEvent("resume_download", "/recruiter/overview", { source: "hero" })}
          >
            Download PDF ↓
          </Button>
          <Button
            href={`mailto:${profileData.contact?.email}`}
            variant="secondary"
            onClick={() =>
              logAnalyticsEvent("contact_click", "/recruiter/overview", {
                channel: "email",
                source: "hero"
              })
            }
          >
            Email Candidate ✉
          </Button>
          <Button
            href={profileData.contact?.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            onClick={() => logAnalyticsEvent("linkedin_click", "/recruiter/overview", { source: "hero" })}
          >
            LinkedIn Profile ↗
          </Button>
          <Button
            href={profileData.contact?.github}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            onClick={() => logAnalyticsEvent("github_click", "/recruiter/overview", { source: "hero" })}
          >
            GitHub Activity ↗
          </Button>
          <Button
            href={profileData.contact?.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            onClick={() =>
              logAnalyticsEvent("contact_click", "/recruiter/overview", {
                channel: "whatsapp",
                source: "hero"
              })
            }
          >
            WhatsApp ↗
          </Button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. QUICK CAREER SNAPSHOT (#snapshot)
          ───────────────────────────────────────────────────────────── */}
      <section id="snapshot" aria-label="Career Snapshot" style={{ marginBottom: "32px" }}>
        <div className="recruiter-metrics-grid">
          {/* Card 1: Experience */}
          <div className="metric-box">
            <span className="metric-label">EXPERIENCE</span>
            <span className="metric-val">3 Practical Roles</span>
            <span className="metric-note">MERN+AI Intern @ BQARLSON, 2 Web Dev Roles</span>
          </div>

          {/* Card 2: Postgraduate Education */}
          <div className="metric-box">
            <span className="metric-label">POSTGRADUATE</span>
            <span className="metric-val">MCA (Cloud Computing)</span>
            <span className="metric-note">Dr. D. Y. Patil IMED, Pune · Expected 2027</span>
          </div>

          {/* Card 3: Undergraduate Degree */}
          <div className="metric-box">
            <span className="metric-label">UNDERGRADUATE</span>
            <span className="metric-val">BCA (Computer Applications)</span>
            <span className="metric-note">Shivaji University · Completed 2023</span>
          </div>

          {/* Card 4: Technical Focus */}
          <div className="metric-box">
            <span className="metric-label">PRIMARY STACK</span>
            <span className="metric-val">Java, Spring Boot, React, SQL</span>
            <span className="metric-note">Layered Architecture & Cloud Fundamentals</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CORE TECHNOLOGY STACK (#skills)
          ───────────────────────────────────────────────────────────── */}
      <section className="card" id="skills" aria-label="Core Technology Competencies" style={{ marginBottom: "32px" }}>
        <div className="section-row-header">
          <div>
            <h2 className="section-title-sm">Core Technology Stack</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Recruiter-friendly groupings derived strictly from CMS skill records and verified in real projects.
            </p>
          </div>
          <Link to="/skills" className="section-link-sm">
            Full Skills Matrix →
          </Link>
        </div>

        <div className="recruiter-skill-groups-grid">
          {/* Frontend */}
          <div className="recruiter-skill-group">
            <div className="skill-group-heading">
              <span className="skill-group-badge">CLIENT-SIDE</span>
              <h3>Frontend & Web</h3>
            </div>
            <div className="skill-chips">
              {frontendCategory.map((s) => (
                <span key={s.name} className={`skill-chip ${s.core ? "core-item" : ""}`}>
                  {s.name}
                  {s.core && <span className="core-star" title="Core competency">★</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div className="recruiter-skill-group">
            <div className="skill-group-heading">
              <span className="skill-group-badge">SERVER-SIDE</span>
              <h3>Backend & Architecture</h3>
            </div>
            <div className="skill-chips">
              {backendCategory.map((s) => (
                <span key={s.name} className={`skill-chip ${s.core ? "core-item" : ""}`}>
                  {s.name}
                  {s.core && <span className="core-star" title="Core competency">★</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Databases */}
          <div className="recruiter-skill-group">
            <div className="skill-group-heading">
              <span className="skill-group-badge">PERSISTENCE</span>
              <h3>Databases & Data Modeling</h3>
            </div>
            <div className="skill-chips">
              {databaseCategory.map((s) => (
                <span key={s.name} className={`skill-chip ${s.core ? "core-item" : ""}`}>
                  {s.name}
                  {s.core && <span className="core-star" title="Core competency">★</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Cloud & Tools */}
          <div className="recruiter-skill-group">
            <div className="skill-group-heading">
              <span className="skill-group-badge">DEVOPS & TOOLS</span>
              <h3>Cloud & Tooling</h3>
            </div>
            <div className="skill-chips">
              {cloudCategory.map((s) => (
                <span key={s.name} className={`skill-chip ${s.core ? "core-item" : ""}`}>
                  {s.name}
                  {s.core && <span className="core-star" title="Core competency">★</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. PROJECT SHOWCASE WITH CONTROLLED ROWS & PAGINATION (#projects)
          ───────────────────────────────────────────────────────────── */}
      <section className="card" id="projects" aria-label="Selected Projects" style={{ marginBottom: "32px" }}>
        <div className="section-row-header">
          <div>
            <h2 className="section-title-sm">Project Showcase & Evidence</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Production-style web applications with real backend architectures and zero fake metrics.
            </p>
          </div>
        </div>

        {/* Real-time Filter & Search Controls */}
        <div className="recruiter-controls-bar">
          <div className="recruiter-search-box">
            <span className="recruiter-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="recruiter-search-input"
              placeholder="Search projects by title, stack, or feature..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Filter projects by search query"
            />
            {searchQuery && (
              <button
                type="button"
                className="recruiter-search-clear"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
          </div>

          <div className="recruiter-filter-pills" role="radiogroup" aria-label="Filter projects by technology">
            {availableTechnologies.map((tech) => (
              <button
                key={tech}
                type="button"
                className={`recruiter-filter-pill ${selectedTech === tech ? "active" : ""}`}
                onClick={() => handleFilterSelect(tech)}
                aria-pressed={selectedTech === tech}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Results Status */}
        <div className="recruiter-results-count">
          Showing <strong>{filteredProjects.length}</strong> project{filteredProjects.length !== 1 ? "s" : ""}
          {selectedTech !== "All" && ` matching technology "${selectedTech}"`}
          {searchQuery && ` with keyword "${searchQuery}"`}
          {totalPages > 1 && ` (Page ${safeCurrentPage} of ${totalPages})`}
        </div>

        {/* Project Cards Grid — Max 2 rows / controlled page size */}
        {paginatedProjects.length > 0 ? (
          <>
            <div className="recruiter-projects-grid">
              {paginatedProjects.map((p, idx) => (
                <article key={p.id} className="recruiter-project-box" aria-label={p.title}>
                  <div className="recruiter-project-top">
                    <span className="recruiter-project-num">
                      #0{(safeCurrentPage - 1) * pageSize + idx + 1}
                    </span>
                    <span
                      className={`project-status ${
                        (p.status || "").toLowerCase().includes("dev")
                          ? "in-development"
                          : "completed"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <h3 className="recruiter-project-title">
                    <Link
                      to={`/projects/${p.slug}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                      onClick={() =>
                        logAnalyticsEvent("project_view", "/recruiter/overview", {
                          slug: p.slug,
                          title: p.title
                        })
                      }
                    >
                      {p.title}
                    </Link>
                  </h3>

                  <div className="recruiter-project-type">{p.type}</div>

                  <p className="recruiter-project-desc">{p.description}</p>

                  {/* Key functionality highlights */}
                  {Array.isArray(p.features) && p.features.length > 0 && (
                    <div className="recruiter-project-highlights">
                      <span className="section-micro-label">KEY ARCHITECTURE & FEATURES:</span>
                      <ul className="recruiter-feature-list">
                        {p.features.slice(0, 3).map((feat, fIdx) => (
                          <li key={fIdx}>• {feat}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technology Pills */}
                  <div className="recruiter-project-tags">
                    {(p.technologies || []).slice(0, 5).map((tech) => (
                      <span key={tech} className="micro-tag">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="recruiter-project-actions">
                    <Button
                      to={`/projects/${p.slug}`}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        logAnalyticsEvent("project_view", "/recruiter/overview", {
                          slug: p.slug,
                          title: p.title
                        })
                      }
                    >
                      Case Study →
                    </Button>
                    {p.github && (
                      <Button
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          logAnalyticsEvent("github_click", "/recruiter/overview", {
                            project: p.title,
                            url: p.github
                          })
                        }
                      >
                        GitHub ↗
                      </Button>
                    )}
                    {p.liveDemo && (
                      <Button
                        href={p.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          logAnalyticsEvent("live_demo_click", "/recruiter/overview", {
                            project: p.title,
                            url: p.liveDemo
                          })
                        }
                      >
                        Live Demo ↗
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls — Clean & Compact */}
            {totalPages > 1 && (
              <nav className="recruiter-pagination" aria-label="Project showcase pages">
                <button
                  type="button"
                  className="recruiter-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous project page"
                >
                  <span className="page-btn-full">← Previous</span>
                  <span className="page-btn-short">← Prev</span>
                </button>

                <span
                  className="recruiter-page-indicator"
                  aria-current="page"
                  aria-label={`Page ${safeCurrentPage} of ${totalPages}`}
                >
                  {safeCurrentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  className="recruiter-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Next project page"
                >
                  <span className="page-btn-full">Next →</span>
                  <span className="page-btn-short">Next →</span>
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="recruiter-empty-state">
            <p>No projects match your filter or search query.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTech("All");
                setSearchQuery("");
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. EXPERIENCE & EDUCATION TWO-COLUMN GRID (#experience, #education)
          ───────────────────────────────────────────────────────────── */}
      <div className="recruiter-main-grid" style={{ marginBottom: "32px" }}>
        {/* Experience Column (#experience) */}
        <section className="card" id="experience" aria-label="Work Experience History">
          <div className="section-row-header">
            <div>
              <h2 className="section-title-sm">Work Experience</h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Chronological internships and hands-on software development roles.
              </p>
            </div>
            <Link to="/experience" className="section-link-sm">
              Full History →
            </Link>
          </div>

          <div className="recruiter-timeline">
            {experienceData.map((exp) => (
              <div key={exp.id} className="recruiter-timeline-item">
                <div className="recruiter-timeline-header">
                  <span className="recruiter-exp-role">{exp.role}</span>
                  {exp.current && <span className="recruiter-current-tag">CURRENT</span>}
                </div>
                <div className="recruiter-exp-company">{exp.company}</div>
                <div className="recruiter-exp-meta">
                  {exp.startDate} – {exp.endDate} · {exp.location}
                </div>
                <p className="recruiter-exp-desc">{exp.description}</p>
                <div className="recruiter-exp-tags">
                  {(exp.technologies || []).slice(0, 6).map((tech) => (
                    <span key={tech} className="micro-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education Column (#education) */}
        <section className="card" id="education" aria-label="Academic Qualifications">
          <div className="section-row-header">
            <div>
              <h2 className="section-title-sm">Education</h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Computer Applications degrees and cloud computing specialization.
              </p>
            </div>
            <Link to="/education" className="section-link-sm">
              Full Details →
            </Link>
          </div>

          <div className="recruiter-education-list">
            {educationData.slice(0, 2).map((edu) => (
              <div key={edu.id} className="recruiter-edu-item">
                <div className="recruiter-edu-header">
                  <span className="recruiter-edu-degree">{edu.degree}</span>
                  {edu.current && <span className="recruiter-current-tag">ACTIVE</span>}
                </div>
                {edu.specialization && (
                  <div className="recruiter-edu-spec">
                    Specialization: <strong>{edu.specialization}</strong>
                  </div>
                )}
                <div className="recruiter-edu-inst">{edu.institution}</div>
                <div className="recruiter-edu-meta">
                  {edu.location} · {edu.year}
                </div>
                {Array.isArray(edu.highlights) && edu.highlights.length > 0 && (
                  <ul className="recruiter-edu-highlights">
                    {edu.highlights.slice(0, 2).map((hl, hIdx) => (
                      <li key={hIdx}>• {hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. CONTEXTUAL ASK JARVIS DECISION SUPPORT (#jarvis)
          ───────────────────────────────────────────────────────────── */}
      <section className="card recruiter-jarvis-card" id="jarvis" aria-label="Recruiter Decision Support Engine" style={{ marginBottom: "32px" }}>
        <div className="recruiter-jarvis-header">
          <div className="recruiter-jarvis-badge">
            <span className="jarvis-pulse" aria-hidden="true" />
            <span>JARVIS RECRUITER ASSISTANT 2.0</span>
          </div>
          <span className="recruiter-jarvis-source">Grounded in Live Supabase Portfolio CMS</span>
        </div>

        <h2 className="recruiter-jarvis-title">Ask JARVIS About Candidate Qualifications</h2>
        <p className="recruiter-jarvis-subtitle">
          Instant answers to recruiter evaluation questions, grounded strictly in live portfolio CMS records.
        </p>

        {/* Suggested Question Chips */}
        <div className="recruiter-jarvis-suggestions" aria-label="Suggested recruiter queries">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              className="recruiter-jarvis-chip"
              onClick={() => {
                setJarvisQuery(q);
                handleRunJarvisQuery(q);
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Query Input Bar */}
        <form
          className="recruiter-jarvis-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleRunJarvisQuery();
          }}
        >
          <input
            type="text"
            className="recruiter-jarvis-input"
            placeholder="Ask anything about Ayyaj's projects, stack, experience, or availability..."
            value={jarvisQuery}
            onChange={(e) => setJarvisQuery(e.target.value)}
            aria-label="Ask JARVIS a candidate question"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={jarvisLoading || !jarvisQuery.trim()}
          >
            {jarvisLoading ? "Analyzing..." : "Ask JARVIS →"}
          </Button>
        </form>

        {/* Structured JARVIS Answer Display */}
        {jarvisResponse && (
          <div className="recruiter-jarvis-output" aria-live="polite">
            <div className="recruiter-jarvis-output-header">
              <span className="jarvis-output-intent">[{jarvisResponse.intent}]</span>
              <h3 className="jarvis-output-heading">{jarvisResponse.heading}</h3>
            </div>
            <p className="jarvis-output-summary">{jarvisResponse.summary}</p>

            {Array.isArray(jarvisResponse.bullets) && jarvisResponse.bullets.length > 0 && (
              <ul className="jarvis-output-bullets">
                {jarvisResponse.bullets.map((b, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </ul>
            )}

            <div className="recruiter-jarvis-output-footer">
              <span className="jarvis-security-tag">
                🔒 Strictly read-only · {jarvisResponse.source || "Grounded in live Supabase CMS"}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. SCHEDULE AN INTERVIEW & CONTACT BANNER (#contact)
          ───────────────────────────────────────────────────────────── */}
      <section className="card recruiter-contact-card" id="contact" aria-label="Schedule an Interview">
        <div className="recruiter-contact-header">
          <span className="section-micro-label">SCHEDULE AN INTERVIEW</span>
          <h2 className="recruiter-contact-title">
            Ready for technical discussions and engineering interviews.
          </h2>
          <p className="recruiter-contact-sub">
            Available for Software Developer &amp; Engineering roles with immediate, notice-free joining. Direct response guaranteed within 24 hours.
          </p>
        </div>

        <div className="recruiter-contact-meta">
          <span>📍 <strong>{profileData.location || "Hinjawadi, Pune, Maharashtra, India"}</strong></span>
          <span>✉ <strong>{profileData.contact?.email}</strong></span>
          <span>📞 <strong>{profileData.contact?.phone}</strong></span>
        </div>

        <div className="recruiter-contact-actions">
          <Button
            href={`mailto:${profileData.contact?.email}`}
            variant="primary"
            onClick={() =>
              logAnalyticsEvent("contact_click", "/recruiter/overview", {
                channel: "email",
                source: "contact_banner"
              })
            }
          >
            Send Email Directly ✉
          </Button>
          <Button
            href={profileData.contact?.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            onClick={() =>
              logAnalyticsEvent("contact_click", "/recruiter/overview", {
                channel: "whatsapp",
                source: "contact_banner"
              })
            }
          >
            WhatsApp ↗
          </Button>
          <Button
            href={`tel:${profileData.contact?.phoneRaw}`}
            variant="outline"
            onClick={() =>
              logAnalyticsEvent("contact_click", "/recruiter/overview", {
                channel: "phone",
                source: "contact_banner"
              })
            }
          >
            Call Direct
          </Button>
          <Button
            href={profileData.contact?.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            onClick={() =>
              logAnalyticsEvent("linkedin_click", "/recruiter/overview", {
                source: "contact_banner"
              })
            }
          >
            LinkedIn Message ↗
          </Button>
        </div>
      </section>
    </div>
  );
}
