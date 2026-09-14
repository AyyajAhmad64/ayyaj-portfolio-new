import React from "react";

export default function EducationCard({ item }) {
  return (
    <div className={`timeline-item ${item.current ? "is-current" : ""}`}>
      {/* Structurally independent marker column */}
      <div className="timeline-marker-column" aria-hidden="true">
        <div className="timeline-marker-dot" />
        <div className="timeline-marker-line" />
      </div>

      {/* Main content card utilizing expanded width */}
      <div className="timeline-content">
        <div className={`timeline-card ${item.current ? "card-current-study" : ""}`}>
          {/* Header Row: Degree, Specialization, Status */}
          <div className="edu-card-header">
            <div className="edu-title-group">
              <div className="edu-title-row">
                <h3 className="edu-degree-title">{item.degree}</h3>
                {item.current ? (
                  <span className="timeline-badge current-study-badge">
                    ● CURRENT STUDIES
                  </span>
                ) : (
                  <span className="edu-completed-badge">
                    {item.status || "COMPLETED"}
                  </span>
                )}
              </div>

              {item.specialization && (
                <div className="edu-spec-line">
                  <span className="edu-spec-prefix">Specialization:</span>{" "}
                  <span className="edu-spec-name">{item.specialization}</span>
                </div>
              )}

              <div className="edu-inst-line">{item.institution}</div>
            </div>

            {/* Year & Location Box */}
            <div className="edu-meta-box">
              <span className="edu-year-tag">{item.year}</span>
              <span className="edu-location-text">{item.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="edu-description">{item.description}</p>

          {/* Highlights */}
          {item.highlights && item.highlights.length > 0 && (
            <div className="edu-highlights-section">
              <span className="edu-highlights-label">PROGRAM HIGHLIGHTS &amp; FOCUS AREAS:</span>
              <ul className="edu-highlights-list">
                {item.highlights.map((h, idx) => (
                  <li key={idx} className="edu-highlight-item">
                    <span className="edu-bullet" aria-hidden="true">→</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
