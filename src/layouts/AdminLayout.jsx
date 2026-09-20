import React, { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import AdminGlobalSearch from "../components/AdminGlobalSearch";
import AdminInstantJarvisModal from "../components/AdminInstantJarvisModal";

export default function AdminLayout() {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isJarvisModalOpen, setIsJarvisModalOpen] = useState(false);
  const [jarvisInitialQuery, setJarvisInitialQuery] = useState("");
  const isCloud = isSupabaseConfigured();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const handleOpenJarvis = (q = "") => {
    setJarvisInitialQuery(q);
    setIsJarvisModalOpen(true);
  };

  const navGroups = [
    {
      group: null,
      items: [
        { label: "Dashboard", path: "/admin", exact: true, icon: "📊" }
      ]
    },
    {
      group: "CONTENT",
      items: [
        { label: "Home Showcase", path: "/admin/home", icon: "🏠" },
        { label: "About & Profile", path: "/admin/profile", icon: "👤" },
        { label: "Experience", path: "/admin/experience", icon: "💼" },
        { label: "Education", path: "/admin/education", icon: "🎓" },
        { label: "Skills", path: "/admin/skills", icon: "⚡" },
        { label: "Projects", path: "/admin/projects", icon: "💻" },
        { label: "Certifications", path: "/admin/certifications", icon: "📜" },
        { label: "Achievements", path: "/admin/achievements", icon: "🏆" },
        { label: "Gallery", path: "/admin/gallery", icon: "🖼️" },
        { label: "Resume Document", path: "/admin/resume", icon: "📄" }
      ]
    },
    {
      group: "ASSETS",
      items: [
        { label: "Media Library 2.0", path: "/admin/media", icon: "📁" }
      ]
    },
    {
      group: "TOOLS",
      items: [
        { label: "Site Health Audit", path: "/admin/health", icon: "🩺" },
        { label: "SEO Manager 2.0", path: "/admin/seo", icon: "🔍" },
        { label: "Backup & Recovery", path: "/admin/backup", icon: "💾" },
        { label: "Version Snapshots", path: "/admin/versions", icon: "⏱️" },
        { label: "Recruiter Portal", path: "/admin/recruiter", icon: "🎯" }
      ]
    },
    {
      group: "SYSTEM",
      items: [
        { label: "Inbound Messages", path: "/admin/messages", icon: "📬" },
        { label: "Analytics & Telemetry", path: "/admin/analytics", icon: "📈" },
        { label: "Audit Logs", path: "/admin/audit", icon: "📋" },
        { label: "Site Settings", path: "/admin/settings", icon: "⚙️" }
      ]
    }
  ];


  return (
    <div className="admin-app">
      {/* Persistent Global Admin Header (Desktop & Mobile) */}
      <header className="admin-top-bar">
        <div className="admin-top-bar-left">
          <button
            type="button"
            className="admin-sidebar-toggle-btn"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle admin sidebar"
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <Link to="/admin" className="admin-top-brand-title" style={{ textDecoration: "none", color: "var(--text-bright)" }}>
            AYYAJ CMS
          </Link>
        </div>
        <div className="admin-top-bar-search">
          <AdminGlobalSearch
            isHeader={true}
            placeholder="Search portfolio, projects, skills, certifications..."
            onOpenJarvis={handleOpenJarvis}
          />
        </div>

        <div className="admin-top-bar-actions">
          <button
            type="button"
            className="admin-header-jarvis-btn"
            onClick={() => handleOpenJarvis("")}
            aria-label="Ask JARVIS (Portfolio Intelligence)"
            title="Ask JARVIS (Portfolio Intelligence)"
          >
            <span>🤖</span>
            <span className="jarvis-btn-label">Ask JARVIS</span>
          </button>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm admin-live-site-btn"
            title="Open public website in a new tab"
          >
            <span>↗</span>
            <span className="live-site-text">Live Site</span>
          </Link>
        </div>
      </header>

      <div className="admin-body">
        {/* Mobile Drawer Backdrop */}
        {sidebarOpen && (
          <div
            className="admin-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`} style={{ overflowY: "auto" }}>
          <div className="admin-sidebar-header">
            <Link to="/admin" className="admin-brand-link">
              <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>AYYAJ CMS</span>
              <span className="admin-badge-v2">SUPABASE CLOUD</span>
            </Link>
          </div>

          <div className="admin-user-pill">
            <span style={{ color: isCloud ? "var(--accent-emerald)" : "var(--accent-amber)" }}>●</span>
            <span style={{ fontSize: "12px", color: "var(--text-bright)", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {adminUser?.email || adminUser?.username || "Admin"}
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-dim)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
              {isCloud ? "LIVE" : "STANDBY"}
            </span>
          </div>

          <nav className="admin-nav" aria-label="Admin Navigation" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {navGroups.map((groupObj, gIdx) => (
              <div key={gIdx} style={{ marginBottom: "6px" }}>
                {groupObj.group && (
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "var(--accent-cyan)",
                      letterSpacing: "0.08em",
                      fontFamily: "var(--font-mono)",
                      padding: "8px 12px 4px",
                      textTransform: "uppercase"
                    }}
                  >
                    {groupObj.group}
                  </div>
                )}
                {groupObj.items.map((item) => (
                  <NavLink
                    key={item.path + item.label}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="admin-nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="admin-nav-text">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar-footer" style={{ marginTop: "auto", paddingTop: "16px" }}>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }}
            >
              Preview Live Site ↗
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              style={{ width: "100%", justifyContent: "center", color: "#f87171" }}
            >
              Sign Out ⎋
            </button>
          </div>
        </aside>

        {/* Main Admin Content */}
        <main className="admin-content-area" onClick={() => sidebarOpen && setSidebarOpen(false)}>
          <Outlet />
        </main>
      </div>

      {/* Instant ASK JARVIS Intelligence Modal */}
      <AdminInstantJarvisModal
        isOpen={isJarvisModalOpen}
        onClose={() => setIsJarvisModalOpen(false)}
        initialQuery={jarvisInitialQuery}
      />
    </div>
  );
}
