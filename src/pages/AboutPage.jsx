import React from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import DeveloperSnapshot from "../components/DeveloperSnapshot";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function AboutPage() {
  const { profile } = usePortfolioData();

  return (
    <>
      <SEO
        title="About"
        description="About Ayyaj Kalandar Shaikh — Software Developer specializing in Java, Spring Boot, React.js, and Cloud Computing (MCA)."
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
          I am <strong>Ayyaj Kalandar Shaikh</strong>, a software developer with a rigorous academic foundation in computer applications and hands-on industry experience building full-stack web platforms. My focus is on crafting robust backend services using <strong>Java and Spring Boot</strong>, architecting component-driven web interfaces in <strong>React.js</strong>, and leveraging <strong>Cloud Computing / AWS</strong> fundamentals for scalable system deployments.
        </p>
      </section>

      {/* Current Focus Panel */}
      <DeveloperSnapshot />

      {/* Professional Overview & Core Architectural Focus Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)", gap: "24px", marginBottom: "32px" }}>
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

          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7" }}>
            Currently pursuing my <strong>Master of Computer Applications (MCA) in Cloud Computing</strong> at Dr. D. Y. Patil Institute of Management and Entrepreneur Development, Pune, I combine rigorous theoretical knowledge in distributed computing, networking, and algorithms with practical software construction.
          </p>

          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7" }}>
            As a <strong>MERN Stack + AI Intern at BQARLSON Software Pvt. Ltd.</strong> in Pune, I actively build full-stack features, integrate RESTful API endpoints, and explore pragmatic generative AI integrations that solve concrete user problems without introducing unnecessary complexity.
          </p>

          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7" }}>
            Prior to my postgraduate studies, I completed my <strong>Bachelor of Computer Applications (BCA)</strong> at Sangameshwar College, Solapur, graduating with 79.50% distinction and solidifying my core competencies in object-oriented programming, data structures, and relational database design.
          </p>
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

          <div>
            <h3 style={{ fontSize: "14px", color: "var(--accent-cyan)", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>
              01. Layered Backend Design
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              Strict separation of concerns applying the Controller-Service-Repository pattern across Spring Boot and ASP.NET Core for maintainable business logic and testable code.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "14px", color: "var(--accent-amber)", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>
              02. Relational Integrity &amp; SQL
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              Normalized schema design, explicit indexing, foreign key constraints, and clean transaction handling across MySQL and Microsoft SQL Server.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "14px", color: "var(--accent-emerald)", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>
              03. Cloud &amp; Distributed Systems
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              Practical focus on AWS fundamentals (EC2, S3, IAM), container concepts, stateless architectures, and serverless compute primitives.
            </p>
          </div>
        </aside>
      </div>

      {/* Engineering Philosophy & Career Direction Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "36px" }}>
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
            <li style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              <strong style={{ color: "var(--text-bright)" }}>Predictability over Cleverness:</strong> Code should be easy to read, debug, and maintain. I prioritize explicit contracts and consistent conventions.
            </li>
            <li style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              <strong style={{ color: "var(--text-bright)" }}>Data Integrity First:</strong> Clean schema migrations, atomic transactions, and thorough validation guard systems against state corruption.
            </li>
            <li style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              <strong style={{ color: "var(--text-bright)" }}>Zero Fluff, High Performance:</strong> Prioritize fast load times, accessible markup, and deterministic interactions without heavy animation bloat.
            </li>
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
            I am preparing for full-time engineering roles upon completion of my postgraduate degree, with readiness for immediate onboarding or internship transitions.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "var(--bg-elevated)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>Target Roles:</span> Software Developer · Full Stack Developer · Java Backend Developer
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>Preferred Location:</span> Pune, Maharashtra, India · Open to Hybrid &amp; Remote
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-emerald)", fontWeight: "700" }}>Notice Period:</span> Immediate / Flexible
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
