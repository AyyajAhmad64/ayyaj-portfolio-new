import React from "react";
import { Link } from "react-router-dom";
import { profileData } from "../data/profile";
import { usePortfolioData } from "../context/PortfolioDataContext";

export default function Footer() {
  const { profile: profileData } = usePortfolioData();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <h3>{profileData.name}</h3>
            <p>{profileData.headline}</p>
            <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-dim)" }}>
              {profileData.location} · {profileData.availability}
            </p>
          </div>

          {/* Explore Column */}
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/skills">Skills</Link></li>
              <li><Link to="/experience">Experience</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/education">Education</Link></li>
            </ul>
          </div>

          {/* Records Column */}
          <div className="footer-col">
            <h4>Credentials</h4>
            <ul>
              <li><Link to="/achievements">Achievements</Link></li>
              <li><Link to="/certifications">Certifications</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/resume">Resume</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="footer-col">
            <h4>Connect</h4>
            <ul>
              <li>
                <a href={profileData.contact.github} target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              </li>
              <li>
                <a href={profileData.contact.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a href={`mailto:${profileData.contact.email}`}>
                  Email Directly ↗
                </a>
              </li>
              <li>
                <a href={profileData.contact.whatsapp} target="_blank" rel="noopener noreferrer">
                  WhatsApp ↗
                </a>
              </li>
              <li>
                <a href={`tel:${profileData.contact.phoneRaw}`}>
                  Call {profileData.contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {currentYear} {profileData.name}. All rights reserved.</span>
          <span style={{ color: "var(--accent-cyan)" }}>
            Engineered with React &amp; React Router
          </span>
        </div>
      </div>
    </footer>
  );
}

