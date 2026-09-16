import React from "react";
import { useParams, Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import ProjectGallery from "../components/ProjectGallery";
import ProjectSnapshot from "../components/ProjectSnapshot";
import ProjectAtAGlance from "../components/ProjectAtAGlance";
import ProjectKeyFeatures from "../components/ProjectKeyFeatures";
import ProjectTechStack from "../components/ProjectTechStack";
import ProjectFlowDiagram from "../components/ProjectFlowDiagram";
import ProjectTechnicalDetails from "../components/ProjectTechnicalDetails";
import ProjectThumbnail from "../components/ProjectThumbnail";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { projects, getProjectBySlug } = usePortfolioData();
  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <div className="empty-state">
        <SEO title="Project Not Found" description="The requested project could not be found." />
        <h3>Project Not Found</h3>
        <p>The project with identifier "{slug}" does not exist in the portfolio registry.</p>
        <Button to="/projects" variant="primary">
          ← Back to All Projects
        </Button>
      </div>
    );
  }

  const isDev = project.status && project.status.toLowerCase().includes("development");
  const statusClass = isDev ? "in-development" : "completed";
  const projectIndex = projects.findIndex((p) => p.slug === slug || p.id === slug);
  const projectNumber = projectIndex !== -1 ? projects.length - projectIndex : 1;
  const numFormatted = String(projectNumber).padStart(2, "0");

  // Related / More projects
  const moreProjects = projects.filter((p) => p.slug !== slug && p.id !== project.id).slice(0, 3);

  // Determine valid links
  const githubUrl = project.github || project.githubUrl || null;
  const liveUrl = project.liveDemo || project.liveUrl || project.demoUrl || null;
  const caseStudyUrl = project.caseStudyUrl || null;

  return (
    <div className="project-detail-page-container">
      <SEO
        title={project.title}
        description={`${project.title} — ${project.type}. ${project.description || project.summary}`}
        image={project.image || project.thumbnail}
        type="article"
      />

      {/* Back Navigation Bar */}
      <nav aria-label="Breadcrumb Navigation" className="project-detail-nav">
        <Link to="/projects" className="project-back-link">
          ← Back to All Projects
        </Link>
        <span className="project-nav-sep">•</span>
        <span className="project-nav-current">{project.title}</span>
      </nav>

      {/* ============================================================
          1. PROJECT HERO
          ============================================================ */}
      <header className="project-hero-header">
        <div className="project-hero-meta-row">
          <span className="project-num-badge">#{numFormatted}</span>
          <span className={`project-status ${statusClass}`}>{project.status || "Completed"}</span>
          <span className="project-category-badge">
            {Array.isArray(project.category) ? project.category.join(" • ") : project.category || "Full Stack"}
          </span>
        </div>

        <h1 className="project-hero-title">{project.title}</h1>
        <p className="project-hero-subtitle">{project.type || "Full Stack Application Architecture"}</p>

        {project.description && (
          <p className="project-hero-lead">{project.description}</p>
        )}

        {/* Quick Tech Badges */}
        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
          <div className="project-hero-tech-pills">
            {project.technologies.slice(0, 6).map((tech) => (
              <span key={tech} className="hero-tech-pill">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons Header */}
        <div className="project-hero-actions">
          {githubUrl && (
            <Button
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
            >
              GitHub Repository ↗
            </Button>
          )}

          {liveUrl && (
            <Button
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="sm"
            >
              Live Application ↗
            </Button>
          )}

          {caseStudyUrl && (
            <Button
              href={caseStudyUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="sm"
            >
              Case Study PDF ↗
            </Button>
          )}
        </div>

        {/* Large Prominent Project Visual Showcase (Gallery / Fallback) */}
        <div className="project-hero-visual-container">
          <ProjectGallery project={project} />
        </div>
      </header>

      {/* ============================================================
          2. QUICK PROJECT SNAPSHOT (COMPACT STRIP)
          ============================================================ */}
      <ProjectSnapshot project={project} />

      {/* ============================================================
          3. "AT A GLANCE" (WHAT I BUILT + 3-5 COMPACT CARDS)
          ============================================================ */}
      <ProjectAtAGlance project={project} />

      {/* ============================================================
          4. KEY FEATURES (VISUALLY SEPARATED CARDS)
          ============================================================ */}
      <ProjectKeyFeatures project={project} />

      {/* ============================================================
          5. TECHNOLOGY STACK (GROUPED VISUAL CARDS)
          ============================================================ */}
      <ProjectTechStack project={project} />

      {/* ============================================================
          6. HOW IT WORKS (SIMPLE SYSTEM ARCHITECTURE FLOW)
          ============================================================ */}
      <ProjectFlowDiagram project={project} />

      {/* ============================================================
          7. IN-DEPTH TECHNICAL DETAILS (EXPANDABLE ACCORDION)
          ============================================================ */}
      <ProjectTechnicalDetails project={project} />

      {/* ============================================================
          8. PROJECT LINKS FOOTER BAR (IF LINKS EXIST)
          ============================================================ */}
      {(githubUrl || liveUrl || caseStudyUrl) && (
        <div className="project-links-banner">
          <div className="project-links-info">
            <span className="section-micro-label">ACCESS PROJECT SOURCE & DEMO</span>
            <h3 className="project-links-title">Inspect Code or Run Application</h3>
          </div>

          <div className="project-links-btns">
            {githubUrl && (
              <Button href={githubUrl} target="_blank" rel="noopener noreferrer" variant="outline">
                Inspect Source Code on GitHub ↗
              </Button>
            )}
            {liveUrl && (
              <Button href={liveUrl} target="_blank" rel="noopener noreferrer" variant="primary">
                Open Live Application ↗
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          9. EXPLORE MORE PROJECTS
          ============================================================ */}
      {moreProjects.length > 0 && (
        <section className="more-projects-section" aria-label="Explore More Projects">
          <div className="section-head-compact">
            <span className="section-micro-label">CONTINUE EXPLORING</span>
            <h2 className="glance-heading">More Projects</h2>
          </div>

          <div className="more-projects-grid">
            {moreProjects.map((rp) => (
              <article key={rp.id} className="card more-project-card">
                <Link
                  to={`/projects/${rp.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ display: "block", marginBottom: "14px" }}
                >
                  <ProjectThumbnail project={rp} />
                </Link>

                <div className="more-project-meta">
                  <span className="more-project-type">{rp.type}</span>
                  {rp.status && (
                    <span className="more-project-status">{rp.status}</span>
                  )}
                </div>

                <h3 className="more-project-title">
                  <Link to={`/projects/${rp.slug}`}>{rp.title}</Link>
                </h3>

                <p className="more-project-desc">{rp.description}</p>

                <div className="more-project-footer">
                  <span className="more-project-stack">{rp.stack}</span>
                  <Button to={`/projects/${rp.slug}`} variant="outline" size="sm">
                    View Project →
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
