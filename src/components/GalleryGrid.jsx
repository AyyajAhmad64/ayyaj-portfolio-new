import React, { useState } from "react";
import Lightbox from "./Lightbox";

export default function GalleryGrid({ items }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <h3>No images available</h3>
        <p>No gallery images currently match this category.</p>
      </div>
    );
  }

  const activeItem = lightboxIndex >= 0 ? items[lightboxIndex] : null;

  return (
    <>
      <div className="gallery-grid">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="gallery-card"
            onClick={() => setLightboxIndex(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLightboxIndex(idx);
              }
            }}
            aria-label={`View ${item.title}`}
          >
            <div className="gallery-thumb-box">
              <img
                src={item.thumbnail || item.src}
                alt={item.alt || item.title}
                loading="lazy"
                className="gallery-thumb-img"
              />
            </div>
            <div className="gallery-caption-box">
              <h3 className="gallery-title">{item.title}</h3>
              <div className="gallery-meta">
                {item.category} {item.date && `• ${item.date}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Lightbox
        isOpen={lightboxIndex >= 0}
        activeItem={activeItem}
        onClose={() => setLightboxIndex(-1)}
        onPrev={() => setLightboxIndex((prev) => Math.max(0, prev - 1))}
        onNext={() => setLightboxIndex((prev) => Math.min(items.length - 1, prev + 1))}
        hasPrev={lightboxIndex > 0}
        hasNext={lightboxIndex < items.length - 1}
      />
    </>
  );
}

