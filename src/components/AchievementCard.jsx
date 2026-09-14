import React from "react";
import { Link } from "react-router-dom";
import Button from "./Button";

export default function AchievementCard({ achievement }) {
  return (
    <article className="card" aria-label={achievement.title}>
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

