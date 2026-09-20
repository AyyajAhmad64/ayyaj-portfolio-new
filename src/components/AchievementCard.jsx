import React from "react";
import { Link } from "react-router-dom";
import Button from "./Button";

export default function AchievementCard({ achievement }) {
  return (
    <article className="card" aria-label={achievement.title}>
      {/* Visual Thumbnail: Image or Designed Achievement Milestone Panel */}
      <div className="showcase-thumb-panel">
        {achievement.image ? (
          <img
            src={achievement.image}
            alt={achievement.title}
            loading="lazy"
            decoding="async"
            className="showcase-thumb-img"
          />
        ) : (
          <div className="achievement-preview-panel">
            <div className="achievement-preview-top">
              <span className="achievement-preview-badge">{achievement.type || "MILESTONE"}</span>
              <span style={{ fontSize: "10px", color: "var(--accent-amber)", fontWeight: "600", fontFamily: "var(--font-mono)" }}>
                ★ HONORS
              </span>
            </div>
            <div className="achievement-preview-body">
              <div className="achievement-seal-icon">🏆</div>
              <div className="achievement-preview-info">
                <div className="achievement-preview-name" title={achievement.title}>{achievement.title}</div>
                <div className="achievement-preview-org">{achievement.organization}</div>
              </div>
            </div>
            <div className="achievement-preview-footer">
              <span>SELECTION &amp; MERIT</span>
              <span>{achievement.date}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-amber)", textTransform: "uppercase" }}>
          {achievement.type}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{achievement.date}</span>
      </div>

      <h3 className="card-title" style={{ marginBottom: "6px" }}>
        <Link to={`/achievements/${achievement.slug}`} style={{ color: "var(--text-bright)" }}>
          {achievement.title}
        </Link>
      </h3>

      <div style={{ color: "var(--accent-cyan)", fontSize: "13px", fontWeight: "600", marginBottom: "10px" }}>
        {achievement.organization}
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "13.5px", lineHeight: "1.6", marginBottom: "16px" }}>
        {achievement.description}
      </p>

      <div style={{ marginTop: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
        <Button to={`/achievements/${achievement.slug}`} variant="outline" size="sm">
          View Details →
        </Button>
        {achievement.link && (
          <Button href={achievement.link} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm">
            External Link ↗
          </Button>
        )}
      </div>
    </article>
  );
}

