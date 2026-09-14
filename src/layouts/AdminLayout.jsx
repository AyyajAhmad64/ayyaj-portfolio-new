import React, { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import Button from "../components/Button";

export default function AdminLayout() {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navSections = [
    { label: "Dashboard", path: "/admin", exact: true, icon: "📊" },
    { label: "Profile", path: "/admin/profile", icon: "👤" },
    { label: "Projects", path: "/admin/projects", icon: "💻" },
    { label: "Experience", path: "/admin/experience", icon: "💼" },
    { label: "Education", path: "/admin/education", icon: "🎓" },
    { label: "Skills", path: "/admin/skills", icon: "⚡" },
    { label: "Certifications", path: "/admin/certifications", icon: "📜" },
    { label: "Achievements", path: "/admin/achievements", icon: "🏆" },
    { label: "Gallery", path: "/admin/gallery", icon: "🖼️" },
    { label: "Media Library", path: "/admin/media", icon: "📁" },
    { label: "Resume", path: "/admin/resume", icon: "📄" },
    { label: "Home Page", path: "/admin/home", icon: "🏠" },
    { label: "Recruiter Mode", path: "/admin/recruiter", icon: "🎯" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" }
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
            ADMIN CMS
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
        <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <div className="admin-sidebar-header">
            <Link to="/admin" className="admin-brand-link">
              <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>AYYAJ CMS</span>
              <span className="admin-badge-v2">PORTAL v2.0</span>
            </Link>
          </div>

          <div className="admin-user-pill">
            <span style={{ color: "var(--accent-emerald)" }}>●</span>
            <span style={{ fontSize: "12px", color: "var(--text-bright)", fontWeight: "600" }}>
              {adminUser?.username || "Admin"}
            </span>
            <span style={{ fontSize: "10.5px", color: "var(--text-dim)", marginLeft: "auto" }}>
              AUTHENTICATED
            </span>
          </div>

          <nav className="admin-nav" aria-label="Admin Navigation">
            {navSections.map((item) => (
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
          </nav>

          <div className="admin-sidebar-footer">
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

