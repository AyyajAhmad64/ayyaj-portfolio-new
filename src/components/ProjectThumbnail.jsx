import React, { useState, useEffect } from "react";

export default function ProjectThumbnail({ project, className = "" }) {
  const [imgError, setImgError] = useState(false);
  const src = project?.thumbnail || project?.image || null;

  // Reset error state when project thumbnail source updates
  useEffect(() => {
    setImgError(false);
  }, [src]);

  // Valid, non-broken image
  if (src && !imgError) {
    return (
      <div className={`project-thumbnail-wrap ${className}`.trim()}>
        <img
          src={src}
          alt={project?.title || "Project Preview"}
          loading="lazy"
          decoding="async"
          className="project-thumbnail-img"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Purpose-built professional typographic fallback card
  const primaryCategory = Array.isArray(project?.category)
    ? project.category[0]
    : project?.category || "Full Stack";
  const stackString = Array.isArray(project?.technologies)
    ? project.technologies.slice(0, 3).join(" • ")
    : project?.stack || "Enterprise Architecture";

  return (
    <div
      className={`project-thumbnail-wrap project-thumbnail-fallback ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="thumb-fallback-top">
        <span className="thumb-fallback-cat">{primaryCategory}</span>
        {project?.status && (
          <span className="thumb-fallback-status">{project.status}</span>
        )}
      </div>

      <div className="thumb-fallback-body">
        <div className="thumb-fallback-icon">⚡</div>
        <div className="thumb-fallback-badge">PROJECT PREVIEW</div>
        <div className="thumb-fallback-title">
          {(project?.title || "Project").toUpperCase()}
        </div>
        <div className="thumb-fallback-type">
          {project?.type || "Full Stack System Architecture"}
        </div>
      </div>

      <div className="thumb-fallback-footer">
        <span className="thumb-fallback-stack">{stackString}</span>
      </div>
    </div>
  );
}
