import React from "react";
import { useParams, Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function AchievementDetailPage() {
  const { slug } = useParams();
  const { getAchievementBySlug } = usePortfolioData();
  const achievement = getAchievementBySlug(slug);

  if (!achievement) {
    return (
      <div className="empty-state">
        <SEO title="Achievement Not Found" description="The requested achievement could not be found." />
        <h3>Achievement Not Found</h3>
        <p>No milestone matching the identifier "{slug}" exists.</p>
        <Button to="/achievements" variant="primary">
          ← Back to All Achievements
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={achievement.title}
        description={`${achievement.title} — ${achievement.type}. ${achievement.description}`}
      />

      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/achievements"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--accent-cyan)",
            fontWeight: "600"
          }}
        >
          ← Back to All Achievements
        </Link>
      </div>

      <PageHeader
        badge={achievement.type}
        title={achievement.title}
        subtitle={`${achievement.organization} · ${achievement.date}`}
      />

      <div className="card" style={{ gap: "20px", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "16px", color: "var(--text-bright)", marginBottom: "8px" }}>
            Milestone Summary
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7" }}>
            {achievement.description}
          </p>
        </div>

        {(achievement.details || achievement.impact) && (
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            <h3 style={{ fontSize: "15px", color: "var(--accent-cyan)", marginBottom: "6px" }}>
              Context &amp; Academic Significance
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13.5px", lineHeight: "1.6" }}>
              {achievement.details || achievement.impact}
            </p>
          </div>
        )}

        {Array.isArray(achievement.highlights) && achievement.highlights.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            <h3 style={{ fontSize: "15px", color: "var(--accent-amber)", marginBottom: "10px" }}>
              Milestone Highlights &amp; Outcomes
            </h3>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--text-muted)", fontSize: "13.5px", lineHeight: "1.7" }}>
              {achievement.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
