import React from "react";
import { Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import { resolveHomeContent } from "../utils/contentDefaults";
import ProjectThumbnail from "./ProjectThumbnail";
import Button from "./Button";
import SEO from "./SEO";

export default function NormalHomeView() {
  const {
    profile: profileData,
    settings: siteSettings,
    featuredProjects = [],
    experience: experienceData = [],
    education: educationData = [],
    achievements: achievementsData = [],
    certifications: certificationsData = [],
    gallery: galleryData = []
  } = usePortfolioData();

  if (!profileData) return null;

  const homeContent = resolveHomeContent(profileData, siteSettings);

  const currentExp = experienceData.find((e) => e.current) || experienceData[0] || {};
  const mcaEducation = educationData.find((e) => e.current) || educationData[0] || {};
  const bcaEducation = educationData.find((e) => !e.current && e.id === "bca-degree") || educationData[1] || {};

  const highlightedSkills = {
    backend: ["Java", "Spring Boot", "REST APIs", "Hibernate / JPA", "ASP.NET Core"],
    frontend: ["React.js", "JavaScript (ES6+)", "HTML5 / CSS3", "Bootstrap"],
    database: ["MySQL", "SQL Server", "MongoDB", "Database Design"],
    cloud: ["Cloud Computing", "AWS Fundamentals", "Layered Architecture"],
    tools: ["Git", "GitHub", "Postman", "Maven", "VS Code"]
  };

  const engineeringPrinciples = [
    {
      title: "Layered Clean Architecture",
      subtitle: "Controller-Service-Repository Pattern",
      desc: "Strict separation of concerns across presentation, business domain logic, and persistent relational data layers for maintainable codebases."
    },
    {
      title: "Relational Persistence & Integrity",
      subtitle: "Normalized Data Modeling",
      desc: "Explicit schema design, transactional boundaries, entity relationships, and query tuning in MySQL and Microsoft SQL Server."
    },
    {
      title: "Practical Full-Stack Execution",
      subtitle: "React Frontend + REST Contracts",
      desc: "Component-driven user interfaces connected with strongly-typed RESTful endpoints, responsive viewport handling, and accessibility standards."
    },
    {
      title: "Continuous Learning & Modernization",
      subtitle: "Cloud & AI Integrations",
      desc: "Postgraduate specialization in Cloud Computing combined with active industry experience integrating AI capabilities into MERN applications."
    }
  ];

  return (
    <div className="home-container" aria-label="Personal Developer Platform — Home">
      <SEO
        title="Home"
        description="Ayyaj Kalandar Shaikh — Software Developer & Full Stack Engineer specializing in Java, Spring Boot, React.js, and Cloud Computing (MCA)."
      />

      {/* ============================================================
          SECTION 1: HERO SECTION (#home)
          ============================================================ */}
      <section className="hero-section" id="home" aria-label="Developer Introduction">
        <div className="hero-grid">
          {/* Hero Left: Narrative & Typography */}
          <div className="hero-identity-col">
            <div className="hero-status-pill">
              <span className="status-live-indicator" aria-hidden="true" />
              <span>{profileData.currentRole}</span>
            </div>

            <h1 className="hero-title">
              <span className="hero-name-first">AYYAJ</span>
              <span className="hero-name-last">KALANDAR SHAIKH</span>
            </h1>

            <div className="hero-role-bar">
              <span className="hero-role-primary">{homeContent.heroRolePrimary}</span>
              <span className="hero-role-divider">/</span>
              <span className="hero-role-secondary">{homeContent.heroRoleSecondary}</span>
            </div>

            <div className="hero-stack-pills">
              {homeContent.heroStackPills.map((pill, pIdx) => (
                <React.Fragment key={pill}>
                  {pIdx > 0 && <span className="bullet-sep">•</span>}
                  <span>{pill}</span>
                </React.Fragment>
              ))}
            </div>

            <p className="hero-positioning">{profileData.bio}</p>

            {/* Action Group */}
            <div className="hero-actions-block">
              <div className="hero-primary-btns">
                <Button
                  to="/projects"
                  variant="primary"
                  size="lg"
                >
                  View Projects →
                </Button>
                <Button
                  to="/contact"
                  variant="secondary"
                  size="lg"
                >
                  Contact Me
                </Button>
              </div>

              <div className="hero-secondary-btns">
                <Button to="/resume" variant="outline" size="sm">
                  Resume
                </Button>
                <Button
                  href={profileData.contact?.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                >
                  GitHub ↗
                </Button>
                <Button
                  href={profileData.contact?.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                >
                  LinkedIn ↗
                </Button>
              </div>
            </div>

            <div className="hero-meta-row">
              <span>📍 {profileData.location}</span>
              <span className="bullet-sep">•</span>
              <span>🎓 {profileData.educationDegree} ({profileData.educationSpecialization})</span>
            </div>
          </div>

          {/* Hero Right: Professional Photo Frame */}
          <div className="hero-visual-col">
            <div className="hero-frame">
              <img
                src="/profile.jpg"
                alt={profileData.name}
                className="hero-image"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='320' viewBox='0 0 280 320'%3E%3Crect fill='%23111722' width='280' height='320'/%3E%3Ctext fill='%2338bdf8' font-family='monospace' font-size='48' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EAK%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="hero-frame-caption">
                <span className="caption-label">{homeContent.heroFrameCaption}</span>
                <span className="caption-val">{homeContent.heroFrameSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: PERSONAL DEVELOPER SNAPSHOT (COMPACT) (#about)
          ============================================================ */}
      <section className="compact-snapshot-strip" id="about" aria-label="Personal Developer Snapshot">
        <div className="snapshot-cell">
          <span className="snapshot-cell-label">CURRENT ROLE</span>
          <span className="snapshot-cell-val">{profileData.snapshot?.currentPosition || profileData.currentRole}</span>
        </div>
        <div className="snapshot-cell">
          <span className="snapshot-cell-label">PRIMARY FOCUS</span>
          <span className="snapshot-cell-val">{profileData.snapshot?.primaryFocus || "Java Backend & Cloud Computing"}</span>
        </div>
        <div className="snapshot-cell">
          <span className="snapshot-cell-label">BACKEND</span>
          <span className="snapshot-cell-val">{profileData.snapshot?.backend || "Java / Spring Boot"}</span>
        </div>
        <div className="snapshot-cell">
          <span className="snapshot-cell-label">FRONTEND</span>
          <span className="snapshot-cell-val">{profileData.snapshot?.frontend || "React.js"}</span>
        </div>
        <div className="snapshot-cell">
          <span className="snapshot-cell-label">CLOUD</span>
          <span className="snapshot-cell-val">{profileData.snapshot?.cloud || "AWS Fundamentals"}</span>
        </div>
        <div className="snapshot-cell">
          <span className="snapshot-cell-label">LOCATION</span>
          <span className="snapshot-cell-val">{profileData.location}</span>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: FEATURED WORK (BEST 2–3 PROJECTS) (#projects)
          ============================================================ */}
      <section className="home-section" id="projects" aria-label="Featured Projects">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">CURATED PORTFOLIO</span>
            <h2 className="home-section-title">{homeContent.featuredHeading}</h2>
            <p className="home-section-desc">
              {homeContent.featuredDesc}
            </p>
          </div>
          <Button to="/projects" variant="outline" size="sm">
            View All Projects ({featuredProjects.length}+) →
          </Button>
        </div>

        <div className="featured-cards-grid">
          {featuredProjects.map((proj, idx) => (
            <article key={proj.id} className="featured-project-card">
              <div className="featured-card-top">
                <span className="featured-index">#0{idx + 1}</span>
                <span
                  className={`project-status ${(proj.status || "").toLowerCase().includes("dev") ? "in-development" : "completed"}`}
                >
                  {proj.status}
                </span>
              </div>

              <Link to={`/projects/${proj.slug}`} tabIndex={-1} aria-hidden="true" style={{ display: "block" }}>
                <ProjectThumbnail project={proj} />
              </Link>

              <div className="featured-card-meta">{proj.type}</div>
              <h3 className="featured-card-title">
                <Link to={`/projects/${proj.slug}`}>{proj.title}</Link>
              </h3>

              <div className="featured-card-stack">{proj.stack}</div>

              <p className="featured-card-desc">{proj.description}</p>

              <div className="featured-tag-cloud">
                {(proj.technologies || []).slice(0, 4).map((t) => (
                  <span key={t} className="featured-mini-tag">
                    {t}
                  </span>
                ))}
              </div>

              <div className="featured-card-actions">
                <Button to={`/projects/${proj.slug}`} variant="outline" size="sm">
                  Explore Case Study →
                </Button>
                {proj.github && (
                  <Button
                    href={proj.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    size="sm"
                  >
                    GitHub ↗
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 4: CAREER SNAPSHOT (#experience)
          ============================================================ */}
      <section className="home-section" id="experience" aria-label="Career Snapshot">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">EXPERIENCE OVERVIEW</span>
            <h2 className="home-section-title">{homeContent.experienceHeading}</h2>
            <p className="home-section-desc">
              {homeContent.experienceDesc}
            </p>
          </div>
          <Button to="/experience" variant="outline" size="sm">
            View Full Experience →
          </Button>
        </div>

        <div className="career-cards-grid">
          {/* Current Role Highlight */}
          <div className="career-card is-active-career">
            <div className="career-tag-current">● CURRENT ROLE</div>
            <h3 className="career-role">{currentExp.role}</h3>
            <div className="career-org">{currentExp.company}</div>
            <div className="career-meta">
              {currentExp.startDate} – {currentExp.endDate} · {currentExp.location} ({currentExp.employmentType})
            </div>
            <p className="career-desc">{currentExp.description}</p>
            <div className="career-tech-row">
              {(currentExp.technologies || []).map((t) => (
                <span key={t} className="micro-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Previous Roles Summary */}
          <div className="career-card">
            <div className="career-tag-previous">PREVIOUS INTERNSHIPS</div>
            <div className="prev-roles-list">
              {experienceData
                .filter((e) => !e.current)
                .map((role) => (
                  <div key={role.id} className="prev-role-item">
                    <div className="prev-role-title">{role.role}</div>
                    <div className="prev-role-company">{role.company}</div>
                    <div className="prev-role-date">
                      {role.startDate} – {role.endDate} · {role.location}
                    </div>
                    <p className="prev-role-desc">{role.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: SKILLS PREVIEW (CONDENSED & SELECTED) (#skills)
          ============================================================ */}
      <section className="home-section" id="skills" aria-label="Core Skills Preview">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">TECHNICAL COMPETENCY</span>
            <h2 className="home-section-title">{homeContent.skillsHeading}</h2>
            <p className="home-section-desc">
              {homeContent.skillsDesc}
            </p>
          </div>
          <Button to="/skills" variant="outline" size="sm">
            Explore All Skills →
          </Button>
        </div>

        <div className="condensed-skills-grid">
          <div className="condensed-skill-col">
            <h3 className="condensed-cat-header">Backend</h3>
            <div className="condensed-chips">
              {highlightedSkills.backend.map((s) => (
                <span key={s} className="skill-chip core-item">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="condensed-skill-col">
            <h3 className="condensed-cat-header">Frontend</h3>
            <div className="condensed-chips">
              {highlightedSkills.frontend.map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="condensed-skill-col">
            <h3 className="condensed-cat-header">Databases</h3>
            <div className="condensed-chips">
              {highlightedSkills.database.map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="condensed-skill-col">
            <h3 className="condensed-cat-header">Cloud &amp; Tools</h3>
            <div className="condensed-chips">
              {[...highlightedSkills.cloud, ...highlightedSkills.tools.slice(0, 3)].map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: EDUCATION SNAPSHOT (#education)
          ============================================================ */}
      <section className="home-section" id="education" aria-label="Academic Education">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">ACADEMIC FOUNDATION</span>
            <h2 className="home-section-title">{homeContent.educationHeading}</h2>
            <p className="home-section-desc">
              {homeContent.educationDesc}
            </p>
          </div>
          <Button to="/education" variant="outline" size="sm">
            View Education →
          </Button>
        </div>

        <div className="education-duo-grid">
          {/* Current MCA */}
          <div className="edu-card is-active-edu">
            <div className="edu-badge-current">● CURRENT POSTGRADUATE STUDIES</div>
            <h3 className="edu-degree">{mcaEducation.degree}</h3>
            <div className="edu-spec">Specialization: {mcaEducation.specialization}</div>
            <div className="edu-school">{mcaEducation.institution}</div>
            <div className="edu-meta">
              {mcaEducation.location} · {mcaEducation.year} ({mcaEducation.status})
            </div>
            <p className="edu-desc">{mcaEducation.description}</p>
          </div>

          {/* Completed BCA */}
          <div className="edu-card">
            <div className="edu-badge-completed">COMPLETED UNDERGRADUATE</div>
            <h3 className="edu-degree">{bcaEducation.degree}</h3>
            <div className="edu-spec">{bcaEducation.specialization}</div>
            <div className="edu-school">{bcaEducation.institution}</div>
            <div className="edu-meta">
              {bcaEducation.location} · {bcaEducation.year} ({bcaEducation.status})
            </div>
            <p className="edu-desc">{bcaEducation.description}</p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: ACHIEVEMENTS & CREDENTIALS PREVIEW (#achievements)
          ============================================================ */}
      <section className="home-section" id="achievements" aria-label="Achievements & Milestones">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">VERIFIED RECORD</span>
            <h2 className="home-section-title">{homeContent.achievementsHeading}</h2>
            <p className="home-section-desc">
              {homeContent.achievementsDesc}
            </p>
          </div>
          <Button to="/achievements" variant="outline" size="sm">
            View Achievements →
          </Button>
        </div>

        <div className="achievements-preview-grid">
          {achievementsData.slice(0, 3).map((item) => (
            <div key={item.id} className="card achievement-preview-box">
              <span className="achievement-micro-tag">{item.type}</span>
              <h3 className="achievement-preview-title">
                <Link to={`/achievements/${item.slug}`}>{item.title}</Link>
              </h3>
              <div className="achievement-preview-org">{item.organization}</div>
              <p className="achievement-preview-desc">{item.description}</p>
              <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                <Link to={`/achievements/${item.slug}`} className="section-link-sm">
                  View Milestone Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 8: CERTIFICATIONS & TRAINING PREVIEW (#certifications)
          ============================================================ */}
      <section className="home-section" id="certifications" aria-label="Certifications & Training">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">CREDENTIALS & LICENSES</span>
            <h2 className="home-section-title">{homeContent.certificationsHeading}</h2>
            <p className="home-section-desc">
              {homeContent.certificationsDesc}
            </p>
          </div>
          <Button to="/certifications" variant="outline" size="sm">
            All Certifications →
          </Button>
        </div>

        <div className="achievements-preview-grid">
          {certificationsData.slice(0, 3).map((cert) => (
            <div key={cert.id} className="card achievement-preview-box">
              <span className="achievement-micro-tag">{cert.issuer}</span>
              <h3 className="achievement-preview-title">{cert.name || cert.title}</h3>
              <div className="achievement-preview-org">{cert.date}</div>
              <p className="achievement-preview-desc">{cert.description}</p>
              {cert.credentialUrl && (
                <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="section-link-sm">
                    Verify Credential ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 9: INTERFACE & DEV GALLERY PREVIEW (#gallery)
          ============================================================ */}
      <section className="home-section" id="gallery" aria-label="Development & Interface Gallery">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">VISUAL ARCHIVE</span>
            <h2 className="home-section-title">{homeContent.galleryHeading}</h2>
            <p className="home-section-desc">
              {homeContent.galleryDesc}
            </p>
          </div>
          <Button to="/gallery" variant="outline" size="sm">
            Open Visual Gallery →
          </Button>
        </div>

        <div className="achievements-preview-grid">
          {galleryData.slice(0, 3).map((item) => (
            <div key={item.id} className="card achievement-preview-box">
              <span className="achievement-micro-tag">{item.category}</span>
              <h3 className="achievement-preview-title">{item.title}</h3>
              <p className="achievement-preview-desc">{item.description}</p>
              <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                <Link to="/gallery" className="section-link-sm">
                  View in Gallery →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 10: PERSONAL SECTION — HOW I BUILD / BEYOND THE CODE (#principles)
          ============================================================ */}
      <section className="home-section" id="principles" aria-label="How I Build — Engineering Principles">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">ENGINEERING PHILOSOPHY</span>
            <h2 className="home-section-title">{homeContent.principlesHeading}</h2>
            <p className="home-section-desc">
              {homeContent.principlesDesc}
            </p>
          </div>
        </div>

        <div className="principles-grid">
          {homeContent.principles.map((p, idx) => (
            <div key={p.title || idx} className="card principle-card">
              <span className="principle-num">0{idx + 1}</span>
              <h3 className="principle-title">{p.title}</h3>
              <div className="principle-sub">{p.subtitle}</div>
              <p className="principle-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 11: CONTACT CTA (#contact)
          ============================================================ */}
      <section className="home-cta-section" id="contact" aria-label="Call to Action">
        <div className="cta-inner-box">
          <span className="section-micro-label">INITIATE COLLABORATION</span>
          <h2 className="cta-heading">{homeContent.contactCtaHeading}</h2>
          <p className="cta-subheading">
            {homeContent.contactCtaSubheading}
          </p>

          <div className="cta-action-buttons">
            <Button to="/contact" variant="primary" size="lg">
              {homeContent.contactCtaButtonText}
            </Button>
            <Button href={`mailto:${profileData.contact?.email}`} variant="outline" size="lg">
              {homeContent.contactEmailButtonText}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
