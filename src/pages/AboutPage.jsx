import React from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import DeveloperSnapshot from "../components/DeveloperSnapshot";
import Button from "../components/Button";
import SEO from "../components/SEO";
import { resolveAboutContent } from "../utils/contentDefaults";

export default function AboutPage() {
  const { profile } = usePortfolioData();
  const about = resolveAboutContent(profile);

  return (
    <>
      <SEO
        title="About"
        description={`About ${profile?.name || "Ayyaj Kalandar Shaikh"} — Software Developer specializing in Java, Spring Boot, React.js, and Cloud Computing (MCA).`}
      />

      <PageHeader
        badge="ABOUT THE DEVELOPER"
        title="Engineering Background & Focus"
        subtitle="Dedicated software engineer pursuing an MCA in Cloud Computing, committed to building clean layered architectures, resilient REST APIs, and responsive web platforms."
      />

      {/* Short Professional Introduction */}
      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderLeft: "3px solid var(--accent-cyan)",
          borderRadius: "var(--radius-sm)",
          padding: "20px 24px",
          marginBottom: "28px"
        }}
        aria-label="Professional Introduction"
      >
        <p style={{ fontSize: "15px", color: "var(--text-main)", lineHeight: "1.7", margin: 0 }}>
          {about.introduction}
        </p>
      </section>

      {/* Current Focus Panel */}
      <DeveloperSnapshot />

      {/* Professional Overview & Core Architectural Focus Grid */}
      <div className="about-overview-grid">
        {/* Professional Overview */}
        <article className="card" style={{ gap: "16px" }}>
          <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
            <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
              BACKGROUND &amp; TRAJECTORY
            </span>
            <h2 style={{ fontSize: "18px", color: "var(--text-bright)", marginTop: "4px" }}>
              Professional Overview
            </h2>
          </div>

          {about.professionalOverview.map((paragraph, idx) => (
            <p key={idx} style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7" }}>
              {paragraph}
            </p>
          ))}
        </article>

        {/* Core Architectural Focus */}
        <aside className="card" style={{ gap: "18px" }}>
          <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
            <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: "700", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
              SYSTEM DESIGN PRINCIPLES
            </span>
            <h2 style={{ fontSize: "18px", color: "var(--text-bright)", marginTop: "4px" }}>
              Core Architectural Focus
            </h2>
          </div>

          {about.architecturalFocus.map((arch, idx) => {
            const colors = ["var(--accent-cyan)", "var(--accent-amber)", "var(--accent-emerald)"];
            const color = colors[idx % colors.length];
            return (
              <div key={idx}>
                <h3 style={{ fontSize: "14px", color, marginBottom: "4px", fontFamily: "var(--font-mono)" }}>
                  {arch.num || `0${idx + 1}`}. {arch.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                  {arch.desc}
                </p>
              </div>
            );
          })}
        </aside>
      </div>

      {/* Engineering Philosophy & Career Direction Grid */}
      <div className="about-values-grid">
        {/* Development Philosophy */}
        <section className="card" style={{ gap: "14px" }}>
          <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
              ENGINEERING VALUES
            </span>
            <h3 style={{ fontSize: "16px", color: "var(--text-bright)", marginTop: "4px" }}>
              Development Philosophy
            </h3>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {about.philosophy.map((item, idx) => (
              <li key={idx} style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                <strong style={{ color: "var(--text-bright)" }}>{item.title}: </strong>
                {item.desc}
              </li>
            ))}
          </ul>
        </section>

        {/* Career Direction */}
        <section className="card" style={{ gap: "14px" }}>
          <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "11px", color: "var(--accent-emerald)", fontWeight: "700", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
              AVAILABILITY &amp; GOALS
            </span>
            <h3 style={{ fontSize: "16px", color: "var(--text-bright)", marginTop: "4px" }}>
              Career Direction
            </h3>
          </div>

          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.65" }}>
            {about.careerDirection}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "var(--bg-elevated)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>Target Roles: </span>
              {profile?.snapshot?.targetRoles || "Software Developer · Full Stack Developer · Java Backend Developer"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>Preferred Location: </span>
              {profile?.location || "Pune, Maharashtra, India · Open to Hybrid & Remote"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-emerald)", fontWeight: "700" }}>Notice Period: </span>
              {profile?.availability || "Immediate / Flexible"}
            </div>
          </div>
        </section>
      </div>

      {/* Relevant Navigation CTAs */}
      <section aria-label="Explore Portfolio Sections">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          <div className="card">
            <h4 style={{ fontSize: "14.5px", color: "var(--text-bright)", marginBottom: "6px" }}>
              Engineering Projects
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Explore production architectures, full-stack implementations, and case studies.
            </p>
            <Button to="/projects" variant="primary" size="sm">
              Explore Projects →
            </Button>
          </div>

          <div className="card">
            <h4 style={{ fontSize: "14.5px", color: "var(--text-bright)", marginBottom: "6px" }}>
              Work Experience
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Review chronological industry internships and technical responsibilities.
            </p>
            <Button to="/experience" variant="outline" size="sm">
              View Experience →
            </Button>
          </div>

          <div className="card">
            <h4 style={{ fontSize: "14.5px", color: "var(--text-bright)", marginBottom: "6px" }}>
              Official Resume
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Review verified curriculum vitae, download the official PDF, or open document view.
            </p>
            <Button to="/resume" variant="outline" size="sm">
              View Resume Document →
            </Button>
          </div>

          <div className="card">
            <h4 style={{ fontSize: "14.5px", color: "var(--text-bright)", marginBottom: "6px" }}>
              Direct Contact
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Connect directly via Email, Phone, WhatsApp, LinkedIn, or GitHub.
            </p>
            <Button to="/contact" variant="ghost" size="sm">
              Contact Ayyaj →
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
