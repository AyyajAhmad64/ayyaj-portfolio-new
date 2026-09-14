import React from "react";
import { Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import Button from "./Button";
import SEO from "./SEO";
import { scrollToTarget } from "../utils/scrollUtils";

export default function RecruiterHomeView() {
  const {
    profile: profileData,
    recruiter: recruiterProfile,
    featuredProjects = [],
    experience: experienceData = [],
    education: educationData = [],
    certifications: certificationsData = []
  } = usePortfolioData();

  if (!profileData || !recruiterProfile) return null;

  const pdfUrl = `/${encodeURIComponent(profileData.contact?.resumePdf || "Ayyaj Kalandar Shaikh - Resume.pdf")}`;

  return (
    <div className="recruiter-view" aria-label="Executive Recruiter Briefing">
      <SEO
        title="Recruiter Overview"
        description="Recruiter & hiring manager overview for Ayyaj Kalandar Shaikh — Software Developer specializing in Java, Spring Boot, React.js, and Cloud Computing."
      />

      {/* Recruiter Header Card (#overview / #home) */}
      <section className="card recruiter-hero-card" id="overview" style={{ marginBottom: "28px" }}>
        <div className="recruiter-hero-top">
          <div>
            <div className="recruiter-badge-group">
              <span className="recruiter-status-pill">
                <span className="mode-dot" aria-hidden="true" />
                {profileData.currentRole}
              </span>
              <span className="recruiter-loc-pill">📍 {profileData.location}</span>
            </div>
            <h1 className="recruiter-name">{profileData.name}</h1>
            <div className="recruiter-title">{profileData.title}</div>
            <div className="recruiter-stack">{profileData.headline}</div>
          </div>

          <div className="recruiter-photo-box">
            <img
              src="/profile.jpg"
              alt={profileData.name}
              className="recruiter-photo"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect fill='%23141a24' width='120' height='120'/%3E%3Ctext fill='%2338bdf8' font-family='monospace' font-size='32' font-weight='bold' x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle'%3EAK%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Executive Pitch */}
        <div className="recruiter-summary-box">
          <div className="section-micro-label">CANDIDATE SUMMARY</div>
          <p className="recruiter-summary-text">{recruiterProfile.summary}</p>
        </div>

        {/* Primary Action Row for Recruiters */}
        <div className="recruiter-actions-row">
          <Button to="/resume" variant="primary">
            View Resume 📄
          </Button>
          <Button href={pdfUrl} download={profileData.contact?.resumePdf || "Ayyaj Kalandar Shaikh - Resume.pdf"} variant="outline">
            Download PDF ↓
          </Button>
          <Button
            to="/projects"
            variant="outline"
          >
            Review Projects ({featuredProjects.length} Featured) →
          </Button>
          <Button
            href={profileData.contact?.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
          >
            LinkedIn Profile ↗
          </Button>
          <Button
            href={profileData.contact?.github}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
          >
            GitHub Activity ↗
          </Button>
          <Button href={`mailto:${profileData.contact?.email}`} variant="secondary">
            Email Candidate ↗
          </Button>
        </div>
      </section>

      {/* Metric Cards */}
      <div className="recruiter-metrics-grid" style={{ marginBottom: "32px" }}>
        {(recruiterProfile.coreMetrics || []).map((m) => (
          <div key={m.label} className="metric-box">
            <span className="metric-label">{m.label}</span>
            <span className="metric-val">{m.value}</span>
            <span className="metric-note">{m.note}</span>
          </div>
        ))}
      </div>

      {/* Two Column Grid: Experience & Key Skills */}
      <div className="recruiter-main-grid" style={{ marginBottom: "36px" }}>
        {/* Experience Column (#experience) */}
        <section className="card" id="experience" aria-label="Experience Summary">
          <div className="section-row-header">
            <h2 className="section-title-sm">Work Experience</h2>
            <Link to="/experience" className="section-link-sm">
              Full History →
            </Link>
          </div>

          <div className="recruiter-timeline">
            {experienceData.map((exp) => (
              <div key={exp.id} className="recruiter-timeline-item">
                <div className="recruiter-timeline-header">
                  <span className="recruiter-exp-role">{exp.role}</span>
                  {exp.current && <span className="recruiter-current-tag">CURRENT</span>}
                </div>
                <div className="recruiter-exp-company">{exp.company}</div>
                <div className="recruiter-exp-meta">
                  {exp.startDate} – {exp.endDate} · {exp.location}
                </div>
                <p className="recruiter-exp-desc">{exp.description}</p>
                <div className="recruiter-exp-tags">
                  {(exp.technologies || []).slice(0, 5).map((tech) => (
                    <span key={tech} className="micro-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Strengths Column (#skills) */}
        <section className="card" id="skills" aria-label="Core Competencies">
          <div className="section-row-header">
            <h2 className="section-title-sm">Technical Stack</h2>
            <Link to="/skills" className="section-link-sm">
              All Skills →
            </Link>
          </div>

          <div className="recruiter-skill-section">
            <span className="micro-label">CORE BACKEND</span>
            <div className="skill-chips" style={{ marginBottom: "16px" }}>
              {["Java", "Spring Boot", "REST APIs", "Hibernate / JPA", "MySQL", "ASP.NET Core"].map((s) => (
                <span key={s} className="skill-chip core-item">
                  {s}
                </span>
              ))}
            </div>

            <span className="micro-label">FRONTEND & WEB</span>
            <div className="skill-chips" style={{ marginBottom: "16px" }}>
              {["React.js", "JavaScript (ES6+)", "HTML5 / CSS3", "Bootstrap", "Responsive Design"].map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                </span>
              ))}
            </div>

            <span className="micro-label">DATABASES & PERSISTENCE</span>
            <div className="skill-chips" style={{ marginBottom: "16px" }}>
              {["MySQL", "SQL Server (SSMS)", "MongoDB", "Database Normalization"].map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                </span>
              ))}
            </div>

            <span className="micro-label">CLOUD & TOOLING</span>
            <div className="skill-chips">
              {["Cloud Computing", "AWS Fundamentals", "Git / GitHub", "Postman", "Maven", "VS Code"].map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Top Projects Spotlight (#projects) */}
      <section className="card" id="projects" style={{ marginBottom: "36px" }} aria-label="Selected Projects">
        <div className="section-row-header">
          <div>
            <h2 className="section-title-sm">Top Featured Projects</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              High-impact full stack web applications with real backend architectures.
            </p>
          </div>
          <Link to="/projects" className="section-link-sm">
            View All Projects →
          </Link>
        </div>

        <div className="recruiter-projects-grid">
          {featuredProjects.map((p, idx) => (
            <div key={p.id} className="recruiter-project-box">
              <div className="recruiter-project-top">
                <span className="recruiter-project-num">#0{idx + 1}</span>
                <span className={`project-status ${(p.status || "").toLowerCase().includes("dev") ? "in-development" : "completed"}`}>
                  {p.status}
                </span>
              </div>
              <h3 style={{ fontSize: "16px", color: "var(--text-bright)", marginBottom: "4px" }}>
                <Link to={`/projects/${p.slug}`} style={{ color: "inherit" }}>
                  {p.title}
                </Link>
              </h3>
              <div style={{ color: "var(--accent-cyan)", fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>
                {p.type}
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.55", marginBottom: "14px" }}>
                {p.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "16px" }}>
                {(p.technologies || []).slice(0, 4).map((tech) => (
                  <span key={tech} className="micro-tag">
                    {tech}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <Button to={`/projects/${p.slug}`} variant="outline" size="sm">
                  Case Study →
                </Button>
                {p.github && (
                  <Button href={p.github} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm">
                    GitHub ↗
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education & Certifications Row */}
      <div className="recruiter-main-grid" style={{ marginBottom: "36px" }}>
        {/* Education (#education) */}
        <section className="card" id="education">
          <div className="section-row-header">
            <h2 className="section-title-sm">Education</h2>
            <Link to="/education" className="section-link-sm">
              Details →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {educationData.slice(0, 2).map((edu) => (
              <div key={edu.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-bright)" }}>
                    {edu.degree}
                  </span>
                  {edu.current && <span className="recruiter-current-tag">ACTIVE</span>}
                </div>
                {edu.specialization && (
                  <div style={{ color: "var(--accent-cyan)", fontSize: "12px", fontWeight: "600" }}>
                    Specialization: {edu.specialization}
                  </div>
                )}
                <div style={{ color: "var(--text-muted)", fontSize: "12.5px" }}>{edu.institution}</div>
                <div style={{ color: "var(--text-dim)", fontSize: "11.5px" }}>
                  {edu.location} · {edu.year}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications (#certifications) */}
        <section className="card" id="certifications">
          <div className="section-row-header">
            <h2 className="section-title-sm">Certifications & Training</h2>
            <Link to="/certifications" className="section-link-sm">
              All Certifications →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {certificationsData.slice(0, 3).map((cert) => (
              <div key={cert.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-bright)" }}>
                  {cert.name || cert.title}
                </div>
                <div style={{ color: "var(--accent-amber)", fontSize: "12px" }}>
                  {cert.issuer} · {cert.date}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>
                  {cert.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recruiter Quick Action Footer Banner (#contact) */}
      <section
        className="card"
        id="contact"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          borderColor: "rgba(56, 189, 248, 0.3)"
        }}
      >
        <div>
          <span className="section-micro-label">SCHEDULE AN INTERVIEW</span>
          <h2 style={{ fontSize: "18px", color: "var(--text-bright)", marginTop: "4px", marginBottom: "4px" }}>
            Ready for technical discussions and engineering interviews.
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Direct email: <strong>{profileData.contact?.email}</strong> · Direct phone:{" "}
            <strong>{profileData.contact?.phone}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button href={`mailto:${profileData.contact?.email}`} variant="primary">
            Send Email Directly ↗
          </Button>
          <Button href={profileData.contact?.whatsapp} target="_blank" rel="noopener noreferrer" variant="secondary">
            WhatsApp ↗
          </Button>
          <Button href={`tel:${profileData.contact?.phoneRaw}`} variant="outline">
            Call Direct
          </Button>
        </div>
      </section>
    </div>
  );
}
