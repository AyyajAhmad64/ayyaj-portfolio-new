import React, { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";

export default function AdminLayout() {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isCloud = isSupabaseConfigured();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
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
        { label: "Home", path: "/admin/home", icon: "🏠" },
        { label: "About / Profile", path: "/admin/profile", icon: "👤" },
        { label: "Experience", path: "/admin/experience", icon: "💼" },
        { label: "Education", path: "/admin/education", icon: "🎓" },
        { label: "Skills", path: "/admin/skills", icon: "⚡" },
        { label: "Projects", path: "/admin/projects", icon: "💻" },
        { label: "Certifications", path: "/admin/certifications", icon: "📜" },
        { label: "Achievements", path: "/admin/achievements", icon: "🏆" },
        { label: "Gallery", path: "/admin/gallery", icon: "🖼️" }
      ]
    },
    {
      group: "ASSETS",
      items: [
        { label: "Media Library", path: "/admin/media", icon: "📁" },
        { label: "Resume Document", path: "/admin/resume", icon: "📄" }
      ]
    },
    {
      group: "RECRUITER",
      items: [
        { label: "Recruiter Mode", path: "/admin/recruiter", icon: "🎯" }
      ]
    },
    {
      group: "AI",
      items: [
        { label: "JARVIS Intelligence", path: "/admin/jarvis", icon: "🤖" }
      ]
    },
    {
      group: "COMMUNICATION",
      items: [
        { label: "Inbound Messages", path: "/admin/messages", icon: "📬" }
      ]
    },
    {
      group: "INSIGHTS",
      items: [
        { label: "Analytics & Telemetry", path: "/admin/analytics", icon: "📈" }
      ]
    },
    {
      group: "SYSTEM",
      items: [
        { label: "SEO & Discoverability", path: "/admin/seo", icon: "🔍" },
        { label: "Site Settings", path: "/admin/settings", icon: "⚙️" },
        { label: "Audit Logs", path: "/admin/audit", icon: "📋" },
        { label: "Version History", path: "/admin/versions", icon: "⏱️" }
      ]
    }
  ];

  return (
    <div className="admin-app">
      {/* Mobile Top Header */}
      <header className="admin-mobile-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle admin sidebar"
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <span style={{ fontWeight: "700", color: "var(--text-bright)", fontSize: "14px" }}>
            ADMIN CONTROL CENTER
          </span>
        </div>

        <Link to="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
          Live Site ↗
        </Link>
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
                    key={item.path}
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
    </div>
  );
}
