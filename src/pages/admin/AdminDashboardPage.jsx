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
import { fetchMessagesInbox } from "../../services/supabaseService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    experience: 0,
    education: 0,
    skillCategories: 0,
    certifications: 0,
    achievements: 0,
    gallery: 0,
    messages: 0,
    unreadMessages: 0
  });

  const [profile, setProfile] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const isCloud = isSupabaseConfigured();

  const loadData = async () => {
    const [projs, exp, edu, skills, certs, ach, gal, prof, msgs] = await Promise.all([
      getProjects(),
      getExperience(),
      getEducation(),
      getSkills(),
      getCertifications(),
      getAchievements(),
      getGallery(),
      getProfile(),
      fetchMessagesInbox()
    ]);

    setStats({
      projects: projs.length,
      experience: exp.length,
      education: edu.length,
      skillCategories: skills.length,
      certifications: certs.length,
      achievements: ach.length,
      gallery: gal.length,
      messages: msgs.length,
      unreadMessages: msgs.filter((m) => m.status === "unread").length
    });

    setProfile(prof);
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
    { title: "Inbound Messages", count: stats.messages, link: "/admin/messages", icon: "📬", color: stats.unreadMessages > 0 ? "#f87171" : "var(--accent-cyan)", badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} NEW` : null },
    { title: "Projects", count: stats.projects, link: "/admin/projects", icon: "💻", color: "var(--accent-cyan)" },
    { title: "Experience", count: stats.experience, link: "/admin/experience", icon: "💼", color: "var(--accent-amber)" },
    { title: "Education", count: stats.education, link: "/admin/education", icon: "🎓", color: "var(--accent-emerald)" },
    { title: "Skills Groups", count: stats.skillCategories, link: "/admin/skills", icon: "⚡", color: "#a78bfa" },
    { title: "Certifications", count: stats.certifications, link: "/admin/certifications", icon: "📜", color: "#f472b6" },
    { title: "Achievements", count: stats.achievements, link: "/admin/achievements", icon: "🏆", color: "#38bdf8" },
    { title: "Gallery Items", count: stats.gallery, link: "/admin/gallery", icon: "🖼️", color: "#fbbf24" }
  ];

  return (
    <div className="admin-page">
      <SEO title="Admin Dashboard" description="Content Management Dashboard for Ayyaj Kalandar Shaikh's developer platform." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">MANAGEMENT CONSOLE</span>
          <h1 className="admin-page-title">Content Overview &amp; Control</h1>
          <p className="admin-page-desc">
            Directly modify, publish, and structure public developer platform entities with real Supabase Cloud database persistence and storage.
          </p>
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

      {/* Cloud Status Banner */}
      <div
        style={{
          padding: "14px 18px",
          background: isCloud ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
          border: `1px solid ${isCloud ? "var(--accent-emerald)" : "var(--accent-amber)"}`,
          borderRadius: "var(--radius-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>{isCloud ? "⚡" : "⚠️"}</span>
          <div>
            <strong style={{ color: isCloud ? "var(--accent-emerald)" : "var(--accent-amber)", fontSize: "13px" }}>
              {isCloud ? "Supabase Cloud Database & Storage: CONNECTED" : "Supabase: Standby Mode (Local Cache Active)"}
            </strong>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
              {isCloud
                ? "All CMS changes sync to Supabase PostgreSQL tables and Storage buckets."
                : "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable direct cloud sync."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link to="/admin/versions" className="btn btn-outline btn-sm">
            Version History ⏱️
          </Link>
          <Link to="/admin/audit" className="btn btn-outline btn-sm">
            Audit Logs 📋
          </Link>
        </div>
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
                <span style={{ fontSize: "24px", fontWeight: "800", color: c.color }}>{c.count}</span>
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
              <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>
                Manage &amp; Edit →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="admin-quick-grid">
        {/* Profile Card */}
        <div className="card">
          <div className="section-row-header">
            <h2 className="section-title-sm">Current Profile Identity</h2>
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

        {/* System & Architecture Info */}
        <div className="card">
          <div className="section-row-header">
            <h2 className="section-title-sm">System &amp; API Architecture</h2>
            <Link to="/admin/settings" className="section-link-sm">
              Settings →
            </Link>
          </div>
          <div style={{ fontSize: "13px", display: "grid", gap: "6px", color: "var(--text-muted)" }}>
            <div><strong>CMS Engine:</strong> Supabase PostgreSQL + Local Cache</div>
            <div><strong>Storage Buckets:</strong> <code>portfolio-media</code>, <code>resume</code></div>
            <div><strong>Row Level Security:</strong> Enabled (Public Read Published, Admin Full Access)</div>
            <div><strong>Contact Form:</strong> Connected to <code>messages</code> table</div>
          </div>
        </div>
      </div>
    </div>
  );
}
