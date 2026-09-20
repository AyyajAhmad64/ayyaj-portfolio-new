import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getProjects,
  getExperience,
  getEducation,
  getSkills,
  getCertifications,
  getAchievements,
  getGallery,
  getProfile,
  resetToDefaults
} from "../../services/dataService";
import { fetchMessagesInbox, fetchAuditLogs } from "../../services/supabaseService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import AdminGlobalSearch from "../../components/AdminGlobalSearch";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    experience: 0,
    education: 0,
    skillCategories: 0,
    certifications: 0,
    achievements: 0,
    gallery: 0,
    featuredActive: 0,
    featuredTotal: 0,
    messages: 0,
    unreadMessages: 0
  });

  const [profile, setProfile] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [healthData, setHealthData] = useState({
    score: 100,
    level: "OPTIMAL",
    issues: []
  });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const isCloud = isSupabaseConfigured();

  const loadData = async () => {
    try {
      setLoading(true);
      const [projs, exp, edu, skills, certs, ach, gal, prof, msgs, logs] = await Promise.all([
        getProjects(),
        getExperience(),
        getEducation(),
        getSkills(),
        getCertifications(),
        getAchievements(),
        getGallery(),
        getProfile(),
        fetchMessagesInbox().catch(() => []),
        fetchAuditLogs().catch(() => [])
      ]);

      const featuredItems = prof?.snapshot?.home?.featuredItems || [];
      const activeFeatured = featuredItems.filter((i) => i.enabled !== false && i.contentId).length;

      const pubProjects = projs.filter((p) => (p.publicationStatus || p.publication_status || "published") === "published").length;
      const draftProjects = projs.length - pubProjects;

      setStats({
        projects: projs.length,
        publishedProjects: pubProjects,
        draftProjects,
        experience: exp.length,
        education: edu.length,
        skillCategories: skills.length,
        certifications: certs.length,
        achievements: ach.length,
        gallery: gal.length,
        featuredActive: activeFeatured,
        featuredTotal: featuredItems.length,
        messages: msgs.length,
        unreadMessages: msgs.filter((m) => m.status === "unread").length
      });

      setProfile(prof);
      setAuditLogs(Array.isArray(logs) ? logs.slice(0, 5) : []);

      // Evaluate Content Health
      const issues = [];
      let totalChecks = 0;
      let passedChecks = 0;

      // Check 1: Featured items count
      totalChecks += 2;
      if (activeFeatured >= 3) {
        passedChecks += 2;
      } else if (activeFeatured > 0) {
        passedChecks += 1;
        issues.push({
          type: "warning",
          label: `Featured Showcase has ${activeFeatured} active items (recommended: 3-6 items for complete showcase).`,
          link: "/admin/home",
          linkText: "Configure Showcase →"
        });
      } else {
        issues.push({
          type: "critical",
          label: "Featured Showcase has 0 active items. Homepage will fall back to default spotlight.",
          link: "/admin/home",
          linkText: "Add Featured Items →"
        });
      }

      // Check 2: Projects completeness
      totalChecks += 2;
      const incompleteProjects = projs.filter((p) => !p.description || (!p.liveDemo && !p.github));
      if (incompleteProjects.length === 0 && projs.length > 0) {
        passedChecks += 2;
      } else if (incompleteProjects.length > 0) {
        passedChecks += 1;
        issues.push({
          type: "warning",
          label: `${incompleteProjects.length} project(s) missing live preview or repository URLs.`,
          link: "/admin/projects",
          linkText: "Review Projects →"
        });
      }

      // Check 3: Profile completeness
      totalChecks += 2;
      if (prof?.name && prof?.title && prof?.contact?.email && prof?.location) {
        passedChecks += 2;
      } else {
        passedChecks += 1;
        issues.push({
          type: "warning",
          label: "Profile identity details incomplete (missing title, location, or contact).",
          link: "/admin/profile",
          linkText: "Complete Profile →"
        });
      }

      // Check 4: Resume Document
      totalChecks += 1;
      const resumeUrl = prof?.snapshot?.resume?.pdfUrl || prof?.resumeUrl;
      if (resumeUrl) {
        passedChecks += 1;
      } else {
        issues.push({
          type: "info",
          label: "No dedicated PDF resume uploaded to Cloud Storage bucket.",
          link: "/admin/resume",
          linkText: "Upload Resume →"
        });
      }

      // Check 5: Certifications
      totalChecks += 1;
      if (certs.length >= 2) {
        passedChecks += 1;
      } else {
        issues.push({
          type: "info",
          label: `Only ${certs.length} credential(s) listed in Certifications.`,
          link: "/admin/certifications",
          linkText: "Add Credentials →"
        });
      }

      // Check 6: Unread messages
      const unreadCount = msgs.filter((m) => m.status === "unread").length;
      if (unreadCount > 0) {
        issues.push({
          type: "info",
          label: `You have ${unreadCount} unread inbound contact inquiry.`,
          link: "/admin/messages",
          linkText: "View Messages →"
        });
      }

      const calculatedScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
      let level = "OPTIMAL";
      if (calculatedScore < 75) level = "NEEDS ATTENTION";
      else if (calculatedScore < 90) level = "GOOD";

      setHealthData({
        score: calculatedScore,
        level,
        issues
      });
    } catch (err) {
      console.error("Dashboard failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    if (window.confirm("Reset all CMS entities to original verified defaults? Any custom drafts will be refreshed.")) {
      setErrorNotice("");
      setNotice("");
      try {
        await resetToDefaults();
        await loadData();
        setNotice("CMS data reset to initial verified records.");
        setTimeout(() => setNotice(""), 3000);
      } catch (err) {
        console.error("Failed to reset CMS defaults:", err);
        setErrorNotice(err.message || "Cloud reset failed. Your data was not reset.");
      }
    }
  };

  const statCards = [
    {
      title: "Inbound Messages",
      count: stats.messages,
      sub: stats.unreadMessages > 0 ? `${stats.unreadMessages} Unread` : "All read",
      link: "/admin/messages",
      icon: "📬",
      color: stats.unreadMessages > 0 ? "#f87171" : "var(--accent-cyan)",
      badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} NEW` : null
    },
    {
      title: "Projects",
      count: stats.projects,
      sub: `${stats.publishedProjects} Published · ${stats.draftProjects} Draft`,
      link: "/admin/projects",
      icon: "💻",
      color: "var(--accent-cyan)"
    },
    {
      title: "Featured Showcase",
      count: `${stats.featuredActive} / ${stats.featuredTotal}`,
      sub: "Active on Homepage",
      link: "/admin/home",
      icon: "⭐",
      color: "var(--accent-amber)"
    },
    {
      title: "Certifications",
      count: stats.certifications,
      sub: "Verified Credentials",
      link: "/admin/certifications",
      icon: "📜",
      color: "#f472b6"
    },
    {
      title: "Achievements",
      count: stats.achievements,
      sub: "Honors & Milestones",
      link: "/admin/achievements",
      icon: "🏆",
      color: "#38bdf8"
    },
    {
      title: "Gallery Items",
      count: stats.gallery,
      sub: "Photos & Media",
      link: "/admin/gallery",
      icon: "🖼️",
      color: "#fbbf24"
    },
    {
      title: "Skills Groups",
      count: stats.skillCategories,
      sub: "Categorized Domains",
      link: "/admin/skills",
      icon: "⚡",
      color: "#a78bfa"
    },
    {
      title: "Experience",
      count: stats.experience,
      sub: "Work History",
      link: "/admin/experience",
      icon: "💼",
      color: "var(--accent-amber)"
    },
    {
      title: "Education",
      count: stats.education,
      sub: "Degrees & Programs",
      link: "/admin/education",
      icon: "🎓",
      color: "var(--accent-emerald)"
    },
    {
      title: "Site Health",
      count: `${healthData.score}%`,
      sub: `Status: ${healthData.level}`,
      link: "/admin/health",
      icon: "🩺",
      color: "var(--accent-emerald)"
    },
    {
      title: "Backup & Recovery",
      count: "Active",
      sub: "JSON Export & Restore",
      link: "/admin/backup",
      icon: "💾",
      color: "var(--accent-cyan)"
    }
  ];

  return (
    <div className="admin-page">
      <SEO title="Admin Control Center — Ayyaj Portfolio CMS" description="Centralized CMS Management Center for developer platform." />

      {/* Header Section */}
      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">MANAGEMENT CONSOLE</span>
          <h1 className="admin-page-title">ADMIN CONTROL CENTER</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isCloud ? "var(--accent-emerald)" : "var(--accent-amber)",
                boxShadow: isCloud ? "0 0 8px var(--accent-emerald)" : "none"
              }}
            />
            <span style={{ fontSize: "13px", color: isCloud ? "var(--accent-emerald)" : "var(--accent-amber)", fontWeight: "600" }}>
              {isCloud ? "Portfolio content is synchronized" : "Local Standby Mode (Cloud offline)"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <Button onClick={handleReset} variant="outline" size="sm">
            ↺ Reset to Defaults
          </Button>
          <Button to="/" target="_blank" rel="noopener noreferrer" variant="primary" size="sm">
            View Live Platform ↗
          </Button>
        </div>
      </div>

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

      {errorNotice && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid var(--accent-rose)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-rose)",
            fontSize: "13px",
            marginBottom: "20px"
          }}
        >
          {errorNotice}
        </div>
      )}

      {/* Global Search Component */}
      <AdminGlobalSearch />

      {/* Quick Actions Bar */}
      <div
        className="card"
        style={{
          padding: "14px 18px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", color: "var(--accent-cyan)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
            QUICK ACTIONS:
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link to="/admin/health" className="btn btn-outline btn-sm">
            🩺 Site Health
          </Link>
          <Link to="/admin/backup" className="btn btn-outline btn-sm">
            💾 Backup &amp; Restore
          </Link>
          <Link to="/admin/seo" className="btn btn-outline btn-sm">
            🔍 SEO Manager
          </Link>
          <Link to="/admin/media" className="btn btn-outline btn-sm">
            📁 Media Library
          </Link>
          <Link to="/admin/projects" className="btn btn-outline btn-sm">
            + New Project
          </Link>
          <Link to="/admin/certifications" className="btn btn-outline btn-sm">
            + New Certification
          </Link>
          <Link to="/admin/achievements" className="btn btn-outline btn-sm">
            + New Achievement
          </Link>
          <Link to="/admin/gallery" className="btn btn-outline btn-sm">
            + New Gallery Item
          </Link>
          <Link to="/admin/home" className="btn btn-primary btn-sm">
            ⭐ Manage Featured
          </Link>
        </div>
      </div>



      {/* Content Health Check Box */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          padding: "20px",
          border: `1px solid ${
            healthData.level === "OPTIMAL"
              ? "var(--accent-emerald)"
              : healthData.level === "GOOD"
              ? "var(--accent-amber)"
              : "var(--accent-rose)"
          }`,
          background: "var(--bg-surface)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>🩺</span>
              <h2 className="section-title-sm" style={{ margin: 0 }}>Content Health &amp; Completeness</h2>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background:
                    healthData.level === "OPTIMAL"
                      ? "rgba(16, 185, 129, 0.15)"
                      : healthData.level === "GOOD"
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  color:
                    healthData.level === "OPTIMAL"
                      ? "var(--accent-emerald)"
                      : healthData.level === "GOOD"
                      ? "var(--accent-amber)"
                      : "var(--accent-rose)",
                  fontFamily: "var(--font-mono)"
                }}
              >
                {healthData.level} ({healthData.score}%)
              </span>
            </div>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "4px 0 0" }}>
              Automated audit of portfolio links, showcase readiness, profile identity, and media references.
            </p>
          </div>

          {/* Score Progress Bar */}
          <div style={{ minWidth: "160px", flex: "0 1 200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "var(--text-muted)" }}>HEALTH SCORE</span>
              <strong style={{ color: "var(--accent-cyan)" }}>{healthData.score}%</strong>
            </div>
            <div style={{ height: "6px", background: "var(--bg-base)", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${healthData.score}%`,
                  background:
                    healthData.level === "OPTIMAL"
                      ? "var(--accent-emerald)"
                      : healthData.level === "GOOD"
                      ? "var(--accent-amber)"
                      : "var(--accent-rose)",
                  transition: "width 0.5s ease"
                }}
              />
            </div>
            <Link
              to="/admin/health"
              className="btn btn-outline btn-sm"
              style={{ marginTop: "10px", width: "100%", textAlign: "center", display: "block", fontSize: "11px" }}
            >
              Full Health Dashboard →
            </Link>
          </div>
        </div>

        {healthData.issues.length > 0 ? (
          <div style={{ display: "grid", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
            {healthData.issues.map((issue, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                  fontSize: "12.5px",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  background: "var(--bg-base)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{issue.type === "critical" ? "🚨" : issue.type === "warning" ? "⚠️" : "💡"}</span>
                  <span style={{ color: "var(--text-bright)" }}>{issue.label}</span>
                </div>
                {issue.link && (
                  <Link to={issue.link} className="section-link-sm" style={{ fontSize: "11.5px" }}>
                    {issue.linkText}
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "12.5px", color: "var(--accent-emerald)", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
            ✓ All content health checks passing. Portfolio is fully configured and production-ready.
          </div>
        )}
      </div>

      {/* Entity Stat Cards Grid */}
      <div className="admin-stat-grid" style={{ marginBottom: "32px" }}>
        {statCards.map((c) => (
          <Link key={c.title} to={c.link} className="card admin-stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: "20px" }} aria-hidden="true">
                {c.icon}
              </span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "22px", fontWeight: "800", color: c.color }}>{c.count}</span>
                {c.badge && (
                  <span style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#f87171" }}>
                    {c.badge}
                  </span>
                )}
              </div>
            </div>
            <div style={{ marginTop: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-bright)" }}>
                {c.title}
              </span>
              {c.sub && (
                <span style={{ display: "block", fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                  {c.sub}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Lower Section: Recent Audit Activity & Profile Overview */}
      <div className="admin-quick-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "20px" }}>
        {/* Recent Audit Activity */}
        <div className="card">
          <div className="section-row-header">
            <h2 className="section-title-sm">Recent Activity &amp; Audit</h2>
            <Link to="/admin/audit" className="section-link-sm">
              All Logs →
            </Link>
          </div>
          {auditLogs.length === 0 ? (
            <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "16px 0" }}>
              No recent audit activity recorded yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    background: "var(--bg-base)",
                    fontSize: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: "700",
                        padding: "2px 5px",
                        borderRadius: "3px",
                        background:
                          log.action === "DELETE"
                            ? "rgba(239, 68, 68, 0.15)"
                            : log.action === "UPSERT"
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(56, 189, 248, 0.15)",
                        color:
                          log.action === "DELETE"
                            ? "#f87171"
                            : log.action === "UPSERT"
                            ? "var(--accent-emerald)"
                            : "var(--accent-cyan)",
                        fontFamily: "var(--font-mono)"
                      }}
                    >
                      {log.action}
                    </span>
                    <span style={{ color: "var(--text-bright)", fontWeight: "600" }}>
                      {log.entity_type}
                    </span>
                  </div>
                  <span style={{ color: "var(--text-dim)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                    {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Profile Identity */}
        <div className="card">
          <div className="section-row-header">
            <h2 className="section-title-sm">Profile Identity</h2>
            <Link to="/admin/profile" className="section-link-sm">
              Edit Profile →
            </Link>
          </div>
          {profile ? (
            <div style={{ fontSize: "13px", display: "grid", gap: "6px" }}>
              <div><strong>Name:</strong> {profile.name}</div>
              <div><strong>Title:</strong> {profile.title}</div>
              <div><strong>Current Role:</strong> {profile.currentRole}</div>
              <div><strong>Location:</strong> {profile.location}</div>
              <div><strong>Email:</strong> {profile.contact?.email}</div>
            </div>
          ) : (
            <div>Loading profile...</div>
          )}
        </div>
      </div>
    </div>
  );
}
