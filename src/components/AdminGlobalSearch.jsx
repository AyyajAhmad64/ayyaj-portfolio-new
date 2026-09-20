import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import { getMedia } from "../services/dataService";
import { fetchMessagesInbox, fetchAuditLogs } from "../services/supabaseService";
import { resolveJarvisQuery } from "../services/jarvisIntelligenceService";

export default function AdminGlobalSearch({
  placeholder = "Search portfolio, projects, skills, certifications...",
  isHeader = false,
  onOpenJarvis = null
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [inlineJarvisAnswer, setInlineJarvisAnswer] = useState(null);
  const [isJarvisLoading, setIsJarvisLoading] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const portfolioData = usePortfolioData() || {};
  const {
    projects = [],
    experience = [],
    education = [],
    skills = [],
    certifications = [],
    achievements = [],
    gallery = []
  } = portfolioData;

  // Debounce input to prevent excessive renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Load auxiliary admin data (Media, Messages, Audit Logs)
  useEffect(() => {
    let isMounted = true;
    const fetchAuxiliary = async () => {
      try {
        const [m, msg, logs] = await Promise.all([
          getMedia().catch(() => []),
          fetchMessagesInbox().catch(() => []),
          fetchAuditLogs().catch(() => [])
        ]);
        if (isMounted) {
          setMediaList(m || []);
          setMessagesList(msg || []);
          setAuditLogsList(logs || []);
        }
      } catch {
        // non-blocking
      }
    };
    fetchAuxiliary();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setInlineJarvisAnswer(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle Ask JARVIS action
  const handleTriggerJarvis = (qStr) => {
    const targetQ = (qStr || query).trim();
    if (!targetQ) return;

    if (onOpenJarvis) {
      setIsOpen(false);
      onOpenJarvis(targetQ);
      return;
    }

    // Fallback: Inline execution
    setIsJarvisLoading(true);
    try {
      const adminData = {
        auditLogs: auditLogsList,
        messages: messagesList,
        media: mediaList
      };
      const answer = resolveJarvisQuery(targetQ, portfolioData, adminData);
      setInlineJarvisAnswer(answer);
    } catch (err) {
      console.error("Inline JARVIS resolution error:", err);
    } finally {
      setIsJarvisLoading(false);
    }
  };

  const handleKeyDownInput = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim().length > 0) {
        handleTriggerJarvis(query);
      }
    }
  };

  const results = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q || q.length < 2) return null;

    const matchedProjects = projects.filter((p) =>
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.shortDescription?.toLowerCase().includes(q) ||
      p.stack?.toLowerCase().includes(q) ||
      (Array.isArray(p.technologies) && p.technologies.some((t) => t.toLowerCase().includes(q))) ||
      p.slug?.toLowerCase().includes(q)
    );

    const matchedCerts = certifications.filter((c) =>
      c.name?.toLowerCase().includes(q) ||
      c.issuer?.toLowerCase().includes(q) ||
      c.credentialId?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      (Array.isArray(c.skills) && c.skills.some((s) => s.toLowerCase().includes(q)))
    );

    const matchedAchievements = achievements.filter((a) =>
      a.title?.toLowerCase().includes(q) ||
      a.organization?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    );

    const matchedGallery = gallery.filter((g) =>
      g.title?.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q) ||
      g.caption?.toLowerCase().includes(q)
    );

    const matchedSkills = skills.filter((s) =>
      s.category?.toLowerCase().includes(q) ||
      (Array.isArray(s.items) && s.items.some((item) => (typeof item === "string" ? item : item.name).toLowerCase().includes(q)))
    );

    const matchedExperience = experience.filter((e) =>
      e.role?.toLowerCase().includes(q) ||
      e.company?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      (Array.isArray(e.technologies) && e.technologies.some((t) => t.toLowerCase().includes(q)))
    );

    const matchedEducation = education.filter((e) =>
      e.degree?.toLowerCase().includes(q) ||
      e.institution?.toLowerCase().includes(q) ||
      e.field?.toLowerCase().includes(q)
    );

    const matchedMedia = mediaList.filter((m) =>
      m.name?.toLowerCase().includes(q) ||
      m.url?.toLowerCase().includes(q)
    );

    const matchedMessages = messagesList.filter((msg) =>
      msg.name?.toLowerCase().includes(q) ||
      msg.email?.toLowerCase().includes(q) ||
      msg.subject?.toLowerCase().includes(q) ||
      msg.message?.toLowerCase().includes(q)
    );

    const totalMatches =
      matchedProjects.length +
      matchedCerts.length +
      matchedAchievements.length +
      matchedGallery.length +
      matchedSkills.length +
      matchedExperience.length +
      matchedEducation.length +
      matchedMedia.length +
      matchedMessages.length;

    return {
      projects: matchedProjects,
      certifications: matchedCerts,
      achievements: matchedAchievements,
      gallery: matchedGallery,
      skills: matchedSkills,
      experience: matchedExperience,
      education: matchedEducation,
      media: matchedMedia,
      messages: matchedMessages,
      totalMatches
    };
  }, [debouncedQuery, projects, certifications, achievements, gallery, skills, experience, education, mediaList, messagesList]);

  return (
    <div
      ref={wrapperRef}
      className={`admin-search-wrapper ${isHeader ? "is-header" : ""}`}
      style={{
        position: "relative",
        width: "100%",
        marginBottom: isHeader ? 0 : "20px"
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span
          style={{
            position: "absolute",
            left: "14px",
            color: "var(--accent-cyan)",
            fontSize: "14px",
            pointerEvents: "none"
          }}
          aria-hidden="true"
        >
          🔍
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setInlineJarvisAnswer(null);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDownInput}
          placeholder={placeholder}
          className="admin-input"
          style={{
            paddingLeft: "40px",
            paddingRight: query ? "36px" : "16px",
            height: isHeader ? "38px" : "44px",
            fontSize: isHeader ? "13px" : "13.5px",
            background: "var(--bg-elevated)",
            borderColor: isOpen && query ? "var(--accent-cyan)" : "var(--border-subtle)",
            boxShadow: isOpen && query ? "0 0 0 2px rgba(56, 189, 248, 0.15)" : "none",
            borderRadius: "var(--radius-sm)"
          }}
          aria-label="Search CMS content"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setInlineJarvisAnswer(null);
            }}
            style={{
              position: "absolute",
              right: "12px",
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "14px",
              padding: "4px"
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results Dropdown Overlay */}
      {isOpen && query.trim().length >= 2 && (
        <div
          className="admin-search-results-box"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--bg-surface)",
            border: "1px solid var(--accent-cyan)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.15)",
            zIndex: 1000,
            maxHeight: "460px",
            overflowY: "auto",
            padding: "14px"
          }}
        >
          {/* Prominent Instant ASK JARVIS Option */}
          <div
            className="search-ask-jarvis-option"
            onClick={() => handleTriggerJarvis(query)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleTriggerJarvis(query)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(56, 189, 248, 0.08)",
              border: "1.5px solid rgba(56, 189, 248, 0.4)",
              marginBottom: "12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>🤖</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  ASK JARVIS: Ask JARVIS about &quot;{query}&quot; →
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Get a portfolio-grounded answer powered by ASK JARVIS Intelligence
                </div>
              </div>
            </div>
            <span
              className="micro-tag"
              style={{
                color: "var(--accent-cyan)",
                borderColor: "var(--accent-cyan)",
                background: "rgba(56, 189, 248, 0.15)",
                whiteSpace: "nowrap",
                flexShrink: 0
              }}
            >
              Ask →
            </span>
          </div>

          {/* Inline JARVIS Answer Display (if triggered without modal) */}
          {inlineJarvisAnswer && (
            <div
              style={{
                marginBottom: "16px",
                padding: "14px",
                background: "var(--bg-base)",
                border: "1px solid var(--accent-cyan)",
                borderRadius: "var(--radius-sm)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ color: "var(--accent-cyan)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>
                  🤖 {inlineJarvisAnswer.heading}
                </strong>
                <button
                  type="button"
                  onClick={() => setInlineJarvisAnswer(null)}
                  style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "12px" }}
                >
                  ✕ Close Answer
                </button>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-bright)", lineHeight: "1.5", margin: "0 0 8px 0" }}>
                {inlineJarvisAnswer.summary}
              </p>
              {Array.isArray(inlineJarvisAnswer.bullets) && inlineJarvisAnswer.bullets.length > 0 && (
                <ul style={{ margin: "0 0 10px 0", paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)" }}>
                  {inlineJarvisAnswer.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              )}
              {Array.isArray(inlineJarvisAnswer.actions) && inlineJarvisAnswer.actions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {inlineJarvisAnswer.actions.map((act, idx) => (
                    <Link
                      key={idx}
                      to={act.link}
                      onClick={() => setIsOpen(false)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: "11px", padding: "2px 8px" }}
                    >
                      {act.label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Top Matches Info Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "8px",
              marginBottom: "8px",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)"
            }}
          >
            <span>
              MATCHES FOUND: <strong style={{ color: "var(--accent-cyan)" }}>{results ? results.totalMatches : 0}</strong>
            </span>
            <span>PRESS ESC TO CLOSE</span>
          </div>

          {results && results.totalMatches === 0 ? (
            <div style={{ padding: "16px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: "13px" }}>
              <div>No CMS content matches &quot;{query}&quot;.</div>
              <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                Click the ASK JARVIS banner above or hit Enter to analyze with JARVIS intelligence.
              </div>
            </div>
          ) : results ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {/* Projects */}
              {results.projects.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title" style={{ fontSize: "10.5px", fontWeight: "700", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    💻 PROJECTS ({results.projects.length})
                  </div>
                  {results.projects.map((p) => (
                    <Link
                      key={p.id}
                      to="/admin/projects"
                      onClick={() => setIsOpen(false)}
                      className="search-result-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "var(--bg-base)",
                        marginBottom: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--text-bright)", fontSize: "12.5px" }}>{p.title}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                          {p.stack}
                        </span>
                      </div>
                      <span className="micro-tag">Edit →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {results.certifications.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title" style={{ fontSize: "10.5px", fontWeight: "700", color: "#f472b6", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    📜 CERTIFICATIONS ({results.certifications.length})
                  </div>
                  {results.certifications.map((c) => (
                    <Link
                      key={c.id}
                      to="/admin/certifications"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "var(--bg-base)",
                        marginBottom: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--text-bright)", fontSize: "12.5px" }}>{c.name}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                          {c.issuer}
                        </span>
                      </div>
                      <span className="micro-tag">Edit →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {results.achievements.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title" style={{ fontSize: "10.5px", fontWeight: "700", color: "#38bdf8", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    🏆 ACHIEVEMENTS ({results.achievements.length})
                  </div>
                  {results.achievements.map((a) => (
                    <Link
                      key={a.id}
                      to="/admin/achievements"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "var(--bg-base)",
                        marginBottom: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--text-bright)", fontSize: "12.5px" }}>{a.title}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                          {a.organization}
                        </span>
                      </div>
                      <span className="micro-tag">Edit →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Gallery */}
              {results.gallery.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title" style={{ fontSize: "10.5px", fontWeight: "700", color: "#fbbf24", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    🖼️ GALLERY ({results.gallery.length})
                  </div>
                  {results.gallery.map((g) => (
                    <Link
                      key={g.id}
                      to="/admin/gallery"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "var(--bg-base)",
                        marginBottom: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--text-bright)", fontSize: "12.5px" }}>{g.title}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                          {g.category}
                        </span>
                      </div>
                      <span className="micro-tag">Edit →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Skills */}
              {results.skills.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title" style={{ fontSize: "10.5px", fontWeight: "700", color: "#a78bfa", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    ⚡ SKILLS ({results.skills.length})
                  </div>
                  {results.skills.map((s) => (
                    <Link
                      key={s.id || s.category}
                      to="/admin/skills"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "var(--bg-base)",
                        marginBottom: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--text-bright)", fontSize: "12.5px" }}>{s.category}</strong>
                      </div>
                      <span className="micro-tag">Edit →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Experience */}
              {results.experience.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title" style={{ fontSize: "10.5px", fontWeight: "700", color: "var(--accent-amber)", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    💼 EXPERIENCE ({results.experience.length})
                  </div>
                  {results.experience.map((e) => (
                    <Link
                      key={e.id}
                      to="/admin/experience"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "var(--bg-base)",
                        marginBottom: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--text-bright)", fontSize: "12.5px" }}>{e.role}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                          {e.company}
                        </span>
                      </div>
                      <span className="micro-tag">Edit →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Education */}
              {results.education.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title" style={{ fontSize: "10.5px", fontWeight: "700", color: "#34d399", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    🎓 EDUCATION ({results.education.length})
                  </div>
                  {results.education.map((edu) => (
                    <Link
                      key={edu.id}
                      to="/admin/education"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "var(--bg-base)",
                        marginBottom: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--text-bright)", fontSize: "12.5px" }}>{edu.degree}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                          {edu.institution}
                        </span>
                      </div>
                      <span className="micro-tag">Edit →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Messages */}
              {results.messages.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title" style={{ fontSize: "10.5px", fontWeight: "700", color: "#f87171", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    📬 MESSAGES ({results.messages.length})
                  </div>
                  {results.messages.map((m) => (
                    <Link
                      key={m.id}
                      to="/admin/messages"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "var(--bg-base)",
                        marginBottom: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--text-bright)", fontSize: "12.5px" }}>{m.name}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                          {m.subject || m.email}
                        </span>
                      </div>
                      <span className="micro-tag">View →</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Media */}
              {results.media.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title" style={{ fontSize: "10.5px", fontWeight: "700", color: "#2dd4bf", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                    📁 MEDIA ASSETS ({results.media.length})
                  </div>
                  {results.media.map((med) => (
                    <Link
                      key={med.id}
                      to="/admin/media"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        background: "var(--bg-base)",
                        marginBottom: "4px",
                        textDecoration: "none"
                      }}
                    >
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                        <strong style={{ color: "var(--text-bright)", fontSize: "12.5px" }}>{med.name}</strong>
                      </div>
                      <span className="micro-tag">Manage →</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
