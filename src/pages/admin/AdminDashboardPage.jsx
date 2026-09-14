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
    gallery: 0
  });

  const [profile, setProfile] = useState(null);
  const [notice, setNotice] = useState("");

  const loadData = async () => {
    const [projs, exp, edu, skills, certs, ach, gal, prof] = await Promise.all([
      getProjects(),
      getExperience(),
      getEducation(),
      getSkills(),
      getCertifications(),
      getAchievements(),
      getGallery(),
      getProfile()
    ]);

    setStats({
      projects: projs.length,
      experience: exp.length,
      education: edu.length,
      skillCategories: skills.length,
      certifications: certs.length,
      achievements: ach.length,
      gallery: gal.length
    });

    setProfile(prof);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    if (window.confirm("Reset all CMS entities to original verified defaults? Any custom drafts will be refreshed.")) {
      await resetToDefaults();
      await loadData();
      setNotice("CMS data reset to initial verified records.");
      setTimeout(() => setNotice(""), 3000);
    }
  };

  const statCards = [
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
            Directly modify, publish, and structure public developer platform entities without touching source code.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
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

      {/* Entity Stat Cards Grid */}
      <div className="admin-stat-grid" style={{ marginBottom: "32px" }}>
        {statCards.map((c) => (
          <Link key={c.title} to={c.link} className="card admin-stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: "20px" }} aria-hidden="true">
                {c.icon}
              </span>
              <span style={{ fontSize: "24px", fontWeight: "800", color: c.color }}>{c.count}</span>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "32px" }}>
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
            <div><strong>Environment:</strong> Production / Local Hybrid</div>
            <div><strong>Storage Engine:</strong> Persistent Client DataStore (LocalStorage)</div>
            <div><strong>API Ready:</strong> CRUD Endpoints Abstracted in `dataService.js`</div>
            <div><strong>Mode Support:</strong> Standard Portfolio + Recruiter Overview</div>
          </div>
        </div>
      </div>
    </div>
  );
}

