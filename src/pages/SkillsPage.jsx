import React from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import SkillGroup from "../components/SkillGroup";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function SkillsPage() {
  const { skills } = usePortfolioData();

  return (
    <>
      <SEO
        title="Skills"
        description="Technical skills matrix for Ayyaj Kalandar Shaikh — Core Java backend, Spring Boot, React.js, databases, cloud, and developer tooling."
      />

      <PageHeader
        badge="TECHNICAL COMPETENCIES"
        title="Skills &amp; Technology Stack"
        subtitle="Categorized inventory of programming languages, enterprise frameworks, persistent databases, and computer science concepts."
      />

      <div className="skills-grid" style={{ marginBottom: "40px" }}>
        {skills.map((group) => (
          <SkillGroup key={group.category} group={group} />
        ))}
      </div>

      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <h3 style={{ fontSize: "16px", color: "var(--text-bright)", marginBottom: "4px" }}>
            See these skills applied in real projects
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Browse full-stack projects showcasing Spring Boot REST APIs, React architectures, and SQL Server persistence.
          </p>
        </div>
        <Button to="/projects" variant="primary">
          View Projects Portfolio →
        </Button>
      </section>
    </>
  );
}
