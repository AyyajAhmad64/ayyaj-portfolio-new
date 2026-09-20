import React, { useState, useEffect, useCallback } from "react";

export default function ProjectGallery({ project }) {
  // Collect all available project screenshots/images
  const rawImages = [
    ...(Array.isArray(project?.images) ? project.images : []),
    project?.thumbnail,
    project?.image
  ].filter(Boolean);

  // Deduplicate image URLs
  const images = Array.from(new Set(rawImages));

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  const validImages = images.filter((img) => !failedImages[img]);
  const hasValidImages = validImages.length > 0;

  // Safe active index within valid images
  const safeIndex = Math.min(activeIndex, Math.max(0, validImages.length - 1));
  const currentImage = validImages[safeIndex] || null;

  // Handle image loading error
  const handleImageError = (src) => {
    setFailedImages((prev) => ({ ...prev, [src]: true }));
  };

  // Keyboard controls for lightbox
  const handleKeyDown = useCallback(
    (e) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % validImages.length);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
      }
    },
    [lightboxOpen, validImages.length]
  );

  useEffect(() => {
    if (lightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, handleKeyDown]);

  // If no images exist or all failed, render high-end intentional fallback visual
  if (!hasValidImages) {
    const techPills = Array.isArray(project?.technologies)
      ? project.technologies.slice(0, 4)
      : (project?.stack || "").split("/").slice(0, 3).map((s) => s.trim()).filter(Boolean);

    return (
      <div className="project-hero-visual fallback-canvas" aria-label="Project Visual Architecture Blueprint">
        <div className="blueprint-topbar">
          <div className="blueprint-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <span className="blueprint-path">
            ayyaj@dev:~/projects/{project?.slug || "architecture"}
          </span>
          <span className="blueprint-status-tag">
            {project?.status || "ENGINEERED"}
          </span>
        </div>

        <div className="blueprint-content">
          <div className="blueprint-emblem" aria-hidden="true">
            <span className="blueprint-icon">⚡</span>
            <div className="blueprint-ring" />
          </div>

          <div className="blueprint-details">
            <span className="blueprint-kicker">ENGINEERED APPLICATION SHOWCASE</span>
            <h2 className="blueprint-title">{project?.title || "System Architecture"}</h2>
            <p className="blueprint-subtitle">{project?.type || "Full Stack Enterprise Application"}</p>

            <div className="blueprint-pills">
              {techPills.map((tech) => (
                <span key={tech} className="blueprint-pill">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="blueprint-footer">
          <span className="blueprint-meta">LAYERED ARCHITECTURE • RELATIONAL SCHEMA • RESTFUL API CONTRACTS</span>
          <span className="blueprint-badge">SPECIFICATION PREVIEW</span>
        </div>
      </div>
    );
  }

  return (
    <div className="project-hero-visual-wrapper">
      {/* Primary Hero Showcase Display */}
      <div className="project-hero-visual" onClick={() => setLightboxOpen(true)}>
        <img
          src={currentImage}
          alt={`${project?.title} screenshot ${safeIndex + 1}`}
          loading="lazy"
          decoding="async"
          className="project-hero-img"
          onError={() => handleImageError(currentImage)}
        />

        <div className="visual-overlay-controls">
          <span className="visual-badge">
            📷 {validImages.length > 1 ? `Screenshot ${safeIndex + 1} of ${validImages.length}` : "Project Screenshot"}
          </span>

          <button
            type="button"
            className="btn-enlarge"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            title="Click to enlarge screenshot"
            aria-label="Enlarge image"
          >
            ⛶ Click to Enlarge
          </button>
        </div>

        {/* Previous / Next Overlay arrows if multiple images */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav-arrow prev"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
              }}
              aria-label="Previous screenshot"
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-nav-arrow next"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev + 1) % validImages.length);
              }}
              aria-label="Next screenshot"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip for Carousel Navigation */}
      {validImages.length > 1 && (
        <div className="gallery-thumbnail-strip" aria-label="Screenshot thumbnails">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`gallery-thumb-btn ${idx === safeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View screenshot ${idx + 1}`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                loading="lazy"
                decoding="async"
                className="gallery-thumb-img"
                onError={() => handleImageError(img)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Accessible Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="project-lightbox-overlay"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen screenshot view"
        >
          <div className="project-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-topbar">
              <span className="lightbox-counter">
                {project?.title} — Screenshot {safeIndex + 1} of {validImages.length}
              </span>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close lightbox"
              >
                ✕ Esc
              </button>
            </div>

            <div className="lightbox-img-stage">
              {validImages.length > 1 && (
                <button
                  type="button"
                  className="lightbox-arrow prev"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length)}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              <img
                src={currentImage}
                alt={`${project?.title} fullscreen screenshot`}
                decoding="async"
                className="lightbox-active-img"
              />

              {validImages.length > 1 && (
                <button
                  type="button"
                  className="lightbox-arrow next"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % validImages.length)}
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>

            {validImages.length > 1 && (
              <div className="lightbox-thumbnails">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`lightbox-thumb-btn ${idx === safeIndex ? "active" : ""}`}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`View screenshot ${idx + 1}`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

