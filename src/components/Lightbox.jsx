import React, { useEffect } from "react";

export default function Lightbox({
  isOpen,
  activeItem,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onClose, onPrev, onNext]);

  if (!isOpen || !activeItem) return null;

  return (
    <div
      className="lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview dialog"
      onClick={onClose}
    >
      <div className="lightbox-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-header">
          <span style={{ fontWeight: "700" }}>{activeItem.title}</span>
          <button
            type="button"
            className="lightbox-btn"
            style={{ width: "32px", height: "32px" }}
            onClick={onClose}
            aria-label="Close image preview"
          >
            ✕
          </button>
        </div>

        <div className="lightbox-body">
          <img
            src={activeItem.src}
            alt={activeItem.alt || activeItem.title}
            className="lightbox-img"
          />

          <div className="lightbox-controls">
            {hasPrev ? (
              <button
                type="button"
                className="lightbox-btn"
                onClick={onPrev}
                aria-label="Previous image"
              >
                ‹
              </button>
            ) : (
              <div />
            )}

            {hasNext ? (
              <button
                type="button"
                className="lightbox-btn"
                onClick={onNext}
                aria-label="Next image"
              >
                ›
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {activeItem.caption && (
          <div className="lightbox-footer">
            <p>{activeItem.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

