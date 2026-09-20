import React, { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { usePortfolioMode } from "../context/ModeContext";
import ModeSwitcher from "../components/ModeSwitcher";
import Button from "../components/Button";
import BackToTop from "../components/BackToTop";
import AIAssistant from "../components/AIAssistant";
import { scrollToTarget } from "../utils/scrollUtils";

export default function RecruiterLayout() {
  const { setMode } = usePortfolioMode();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMode("recruiter");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setMobileMenuOpen(false);
  }, [location.pathname, setMode]);

  const handleAnchorClick = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname === "/recruiter/overview") {
      scrollToTarget(id, true);
    }
  };

  return (
    <div className="app-layout recruiter-theme">
      {/* Dedicated Executive Recruiter Header */}
      <header className="recruiter-navbar">
        <div className="recruiter-nav-inner">
          <div className="recruiter-brand-group">
            {/* Mobile Navigation Hamburger (44x44px touch target) prioritized on mobile */}
            <button
              type="button"
              className="recruiter-nav-mobile-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>

            <Link to="/recruiter/overview" className="recruiter-logo">
              <span className="recruiter-logo-accent">AYYAJ SHAIKH</span>
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
            {/* Unified Mode Switcher: [ Portfolio | ● Recruiter ] */}
            <ModeSwitcher />
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="recruiter-nav-drawer" aria-label="Mobile Recruiter Navigation">
            <div className="recruiter-drawer-section">
              <span className="drawer-section-label">IN-PAGE QUICK JUMPS</span>
              <div className="drawer-jumps-grid">
                <a
                  href="#overview"
                  className="drawer-jump-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick("overview");
                  }}
                >
                  Overview
                </a>
                <a
                  href="#snapshot"
                  className="drawer-jump-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick("snapshot");
                  }}
                >
                  Career Snapshot
                </a>
                <a
                  href="#skills"
                  className="drawer-jump-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick("skills");
                  }}
                >
                  Core Skills
                </a>
                <a
                  href="#projects"
                  className="drawer-jump-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick("projects");
                  }}
                >
                  Project Showcase
                </a>
                <a
                  href="#experience"
                  className="drawer-jump-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick("experience");
                  }}
                >
                  Experience
                </a>
                <a
                  href="#education"
                  className="drawer-jump-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick("education");
                  }}
                >
                  Education
                </a>
                <a
                  href="#jarvis"
                  className="drawer-jump-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick("jarvis");
                  }}
                >
                  Ask JARVIS ⚡
                </a>
                <a
                  href="#contact"
                  className="drawer-jump-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick("contact");
                  }}
                >
                  Schedule Interview
                </a>
              </div>
            </div>

            <div className="recruiter-drawer-section">
              <span className="drawer-section-label">PORTFOLIO PAGES</span>
              <div className="drawer-links-list">
                <Link
                  to="/recruiter/overview"
                  className="drawer-page-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Candidate Overview
                </Link>
                <Link
                  to="/projects"
                  className="drawer-page-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Projects Catalog
                </Link>
                <Link
                  to="/experience"
                  className="drawer-page-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Full Experience
                </Link>
                <Link
                  to="/skills"
                  className="drawer-page-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Skills Matrix
                </Link>
                <Link
                  to="/education"
                  className="drawer-page-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Education
                </Link>
                <Link
                  to="/resume"
                  className="drawer-page-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resume (PDF)
                </Link>
                <Link
                  to="/contact"
                  className="drawer-page-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Direct Contact
                </Link>
              </div>
            </div>

            <div className="drawer-bottom-actions">
              <Button
                to="/"
                onClick={() => {
                  setMode("normal");
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                size="sm"
              >
                ← Switch to Portfolio Mode
              </Button>
              <Button
                to="/resume"
                variant="primary"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Download Resume PDF ↓
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Recruiter Content */}
      <main className="main-content" id="recruiterMainContent">
        <Outlet />
      </main>

      {/* Floating Action System: Move To Top (above) & Ask JARVIS (below) */}
      <BackToTop />
      <AIAssistant />

      {/* Recruiter Executive Footer */}
      <footer className="recruiter-footer">
        <div
          className="footer-inner"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12.5px"
          }}
        >
          <div>
            <strong>Ayyaj Kalandar Shaikh</strong> — Candidate Profile for Software Engineering Roles
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
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
