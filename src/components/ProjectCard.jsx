import React from "react";
import { Link } from "react-router-dom";
import ProjectThumbnail from "./ProjectThumbnail";
import Button from "./Button";

export default function ProjectCard({ project, projectNumber }) {
  const isDev = project.status && project.status.toLowerCase().includes("development");
  const statusClass = isDev ? "in-development" : "completed";
  const numFormatted = String(projectNumber).padStart(2, "0");

  return (
    <article className="project-card" aria-label={`${project.title} project showcase`}>
      <div className="project-top">
        <span className="project-number">#{numFormatted}</span>
        <span className={`project-status ${statusClass}`}>{project.status}</span>
      </div>

      <Link
        to={`/projects/${project.slug}`}
        style={{ display: "block" }}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProjectThumbnail project={project} />
      </Link>

      <div className="project-kicker">{project.type}</div>
      <h3 className="card-title" style={{ marginBottom: "8px" }}>
        <Link to={`/projects/${project.slug}`} style={{ color: "var(--text-bright)" }}>
          {project.title}
        </Link>
      </h3>

      <p className="project-desc">{project.description}</p>

      {project.technologies && project.technologies.length > 0 && (
        <div className="project-tags" aria-label="Technologies used">
          {project.technologies.map((tech) => (
            <span key={tech} className="project-tag">
              {tech}
            </span>
          ))}
        </div>
      )}

      {project.features && project.features.length > 0 && (
        <ul className="project-features" aria-label="Key features">
          {project.features.slice(0, 3).map((feat, idx) => (
            <li key={idx}>{feat}</li>
          ))}
        </ul>
      )}

      <div className="project-actions">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button to={`/projects/${project.slug}`} variant="outline" size="sm">
            Case Study →
          </Button>
          {project.github ? (
            <Button
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="sm"
            >
              GitHub ↗
            </Button>
          ) : (
            <span style={{ fontSize: "11px", color: "var(--text-dim)", padding: "4px 8px" }}>
              Private Repo
            </span>
          )}
        </div>

        {project.liveDemo && (
          <Button
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="sm"
          >
            Live Demo ↗
          </Button>
        )}
      </div>
    </article>
  );
}

