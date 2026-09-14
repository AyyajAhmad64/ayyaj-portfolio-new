import React, { useEffect } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { usePortfolioMode } from "../context/ModeContext";
import Button from "../components/Button";

import AIAssistant from "../components/AIAssistant";

export default function RecruiterLayout() {
  const { setMode } = usePortfolioMode();
  const location = useLocation();

  useEffect(() => {
    setMode("recruiter");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, setMode]);

  return (
    <div className="app-layout recruiter-theme">
      {/* Dedicated Executive Recruiter Header */}
      <header className="recruiter-navbar">
        <div className="recruiter-nav-inner">
          <div className="recruiter-brand-group">
            <Link to="/recruiter/overview" className="recruiter-logo">
              <span className="recruiter-logo-accent">AYYAJ SHAIKH</span>
              <span className="recruiter-logo-tag">RECRUITER PORTAL</span>
            </Link>
          </div>

          <nav className="recruiter-nav-links" aria-label="Recruiter Navigation">
            <NavLink
              to="/recruiter/overview"
              className={({ isActive }) => `recruiter-link ${isActive ? "active" : ""}`}
            >
              Candidate Overview
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) => `recruiter-link ${isActive ? "active" : ""}`}
            >
              Projects
            </NavLink>
            <NavLink
              to="/experience"
              className={({ isActive }) => `recruiter-link ${isActive ? "active" : ""}`}
            >
              Experience
            </NavLink>
            <NavLink
              to="/skills"
              className={({ isActive }) => `recruiter-link ${isActive ? "active" : ""}`}
            >
              Skills Matrix
            </NavLink>
            <NavLink
              to="/education"
              className={({ isActive }) => `recruiter-link ${isActive ? "active" : ""}`}
            >
              Education
            </NavLink>
            <NavLink
              to="/resume"
              className={({ isActive }) => `recruiter-link ${isActive ? "active" : ""}`}
            >
              Resume (PDF)
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => `recruiter-link ${isActive ? "active" : ""}`}
            >
              Contact
            </NavLink>
          </nav>

          <div className="recruiter-nav-actions">
            {/* Quick exit to standard portfolio */}
            <Button
              to="/"
              onClick={() => setMode("normal")}
              variant="outline"
              size="sm"
              title="Return to standard developer portfolio view"
            >
              ← Portfolio Mode
            </Button>
            <Button to="/resume" variant="primary" size="sm">
              Resume ↓
            </Button>
          </div>
        </div>
      </header>

      {/* Main Recruiter Content */}
      <main className="main-content" id="recruiterMainContent">
        <Outlet />
      </main>

      <AIAssistant />

      {/* Recruiter Executive Footer */}
      <footer className="recruiter-footer">
        <div className="footer-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "12.5px" }}>
          <div>
            <strong>Ayyaj Kalandar Shaikh</strong> — Candidate Profile for Software Engineering Roles
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link to="/" onClick={() => setMode("normal")} style={{ color: "var(--accent-cyan)" }}>
              Switch to Full Portfolio Mode
            </Link>
            <Link to="/contact" style={{ color: "var(--text-bright)" }}>
              Direct Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

