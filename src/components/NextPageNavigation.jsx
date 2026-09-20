import React from "react";
import { Link } from "react-router-dom";

export default function NextPageNavigation({ prev, next, finalCta }) {
  if (!prev && !next && !finalCta) return null;

  return (
    <nav className="next-page-nav-container" aria-label="Portfolio Page Navigation">
      <div className={`next-page-nav-grid ${!prev ? "has-only-next" : ""}`}>
        {/* Previous Page Link */}
        {prev && (
          <Link
            to={prev.to}
            className="next-page-card prev-card"
            aria-label={`Go to previous section: ${prev.label}`}
          >
            <div className="next-page-meta">
              <span className="next-page-arrow" aria-hidden="true">←</span>
              <span className="next-page-dir-label">PREVIOUS</span>
            </div>
            <div className="next-page-title">{prev.label}</div>
            {prev.description && (
              <div className="next-page-desc">{prev.description}</div>
            )}
          </Link>
        )}

        {/* Next Page Link */}
        {next && (
          <Link
            to={next.to}
            className="next-page-card next-card"
            aria-label={`Go to next section: ${next.label}`}
          >
            <div className="next-page-meta">
              <span className="next-page-dir-label">NEXT</span>
              <span className="next-page-arrow" aria-hidden="true">→</span>
            </div>
            <div className="next-page-title">{next.label}</div>
            {next.description && (
              <div className="next-page-desc">{next.description}</div>
            )}
          </Link>
        )}

        {/* Final Tour CTA (e.g. on Resume page) */}
        {!next && finalCta && (
          <Link
            to={finalCta.to}
            className="next-page-card next-card is-final-cta"
            aria-label={finalCta.label}
          >
            <div className="next-page-meta">
              <span className="next-page-dir-label">WRAP UP</span>
              <span className="next-page-arrow" aria-hidden="true">✦</span>
            </div>
            <div className="next-page-title">{finalCta.label}</div>
            {finalCta.description && (
              <div className="next-page-desc">{finalCta.description}</div>
            )}
          </Link>
        )}
      </div>
    </nav>
  );
}

