import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { usePortfolioMode } from "../context/ModeContext";
import { usePortfolioData } from "../context/PortfolioDataContext";
import ModeSwitcher from "./ModeSwitcher";
import Button from "./Button";
import { scrollToTop } from "../utils/scrollUtils";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isRecruiter } = usePortfolioMode();
  const { profile } = usePortfolioData();

  // Close mobile menu on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "";
  }, [location.pathname]);

  // Prevent background body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const normalNavItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Skills", path: "/skills" },
    { label: "Experience", path: "/experience" },
    { label: "Projects", path: "/projects" },
    { label: "Education", path: "/education" },
    { label: "Achievements", path: "/achievements" },
    { label: "Certifications", path: "/certifications" },
    { label: "Gallery", path: "/gallery" },
    { label: "Contact", path: "/contact" }
  ];

  const recruiterNavItems = [
    { label: "Overview", path: "/" },
    { label: "Experience", path: "/experience" },
    { label: "Skills", path: "/skills" },
    { label: "Projects", path: "/projects" },
    { label: "Education", path: "/education" },
    { label: "Certifications", path: "/certifications" },
    { label: "Resume", path: "/resume" },
    { label: "Contact", path: "/contact" }
  ];

  const currentNavItems = isRecruiter ? recruiterNavItems : normalNavItems;

  const handleNavClick = (e, item) => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      document.body.style.overflow = "";
    }

    // If clicking the link for the page the user is ALREADY on, smoothly scroll to top
    if (location.pathname === item.path) {
      e.preventDefault();
      scrollToTop();
    }
  };

  const handleBrandClick = (e) => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      document.body.style.overflow = "";
    }
    if (location.pathname === "/") {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Terminal Identifier */}
        <NavLink to="/" onClick={handleBrandClick} className="nav-brand" aria-label="Ayyaj Kalandar Shaikh — Home">
          <span className="nav-brand-prefix">ayyaj@dev:~$</span>
          {isRecruiter && (
            <span className="nav-recruiter-tag">
              RECRUITER
            </span>
          )}
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="desktop-nav">
          <ul className="nav-links">
            {currentNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  onClick={(e) => handleNavClick(e, item)}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Header Right Actions */}
        <div className="nav-actions">
          {/* Mode Switcher */}
          <div className="nav-mode-wrapper">
            <ModeSwitcher />
          </div>

          {/* Dedicated Resume Page Navigation Action */}
          <NavLink
            to="/resume"
            className={({ isActive }) => `nav-resume-action ${isActive ? "active" : ""}`}
            title="Open dedicated Resume page"
            aria-label="View official Resume"
          >
            <span className="nav-resume-icon" aria-hidden="true">📄</span>
            <span className="nav-resume-text">Resume</span>
            <span className="nav-resume-arrow" aria-hidden="true">↗</span>
          </NavLink>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="nav-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`mobile-nav-overlay ${mobileMenuOpen ? "is-open" : ""}`}
        onClick={() => {
          setMobileMenuOpen(false);
          document.body.style.overflow = "";
        }}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">
              {isRecruiter ? "RECRUITER BRIEFING" : "PORTFOLIO NAVIGATION"}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                document.body.style.overflow = "";
              }}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="mobile-mode-container">
            <ModeSwitcher />
          </div>

          <div className="mobile-links-container">
            {currentNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={(e) => handleNavClick(e, item)}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mobile-nav-footer-actions">
            {(() => {
              const resumePdf = profile?.contact?.resumePdf || "Ayyaj Kalandar Shaikh - Resume.pdf";
              const resumePdfUrl = resumePdf.startsWith("http")
                ? resumePdf
                : (resumePdf.startsWith("/") ? resumePdf : `/${encodeURIComponent(resumePdf)}`);
              return (
                <a
                  href={resumePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ justifyContent: "center" }}
                >
                  📄 View Resume PDF ↗
                </a>
              );
            })()}
            <Button to="/resume" variant="outline" size="sm" style={{ justifyContent: "center" }}>
              Interactive Resume Page →
            </Button>
            <Button to="/contact" variant="secondary" size="sm" style={{ justifyContent: "center" }}>
              Direct Contact
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
