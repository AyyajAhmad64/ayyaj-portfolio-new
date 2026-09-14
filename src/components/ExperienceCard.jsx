import React from "react";

export default function ExperienceCard({ item }) {
  return (
    <div className={`timeline-item ${item.current ? "is-current" : ""}`}>
      {/* Structurally independent marker column */}
      <div className="timeline-marker-column" aria-hidden="true">
        <div className="timeline-marker-dot" />
        <div className="timeline-marker-line" />
      </div>

      {/* Main content card utilizing expanded width */}
      <div className="timeline-content">
        <div className={`timeline-card ${item.current ? "card-current-role" : ""}`}>
          {/* Header Row: Title, Company, Status Badge */}
          <div className="exp-card-header">
            <div className="exp-title-group">
              <div className="exp-title-row">
                <h3 className="exp-role-title">{item.role}</h3>
                {item.current && (
                  <span className="timeline-badge current-role-badge">
                    ● CURRENT ROLE
                  </span>
                )}
              </div>
              <div className="exp-company-line">
                <span className="exp-company-name">{item.company}</span>
                <span className="exp-dot-sep">•</span>
                <span className="exp-emp-type">{item.employmentType}</span>
              </div>
            </div>

            {/* Date & Location Pill */}
            <div className="exp-date-box">
              <span className="exp-date-range">
                {item.startDate} – {item.endDate}
                {item.duration && ` (${item.duration})`}
              </span>
              <span className="exp-location-tag">{item.location}</span>
            </div>
          </div>

          {/* Role Narrative */}
          <p className="exp-description">{item.description}</p>

          {/* Technology Badges */}
          {item.technologies && item.technologies.length > 0 && (
            <div className="exp-tech-section">
              <span className="exp-tech-label">CORE TECHNOLOGIES &amp; WORKFLOWS:</span>
              <div className="exp-tech-chips">
                {item.technologies.map((tech) => (
                  <span key={tech} className="exp-tech-chip">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
