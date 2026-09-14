import React from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import ExperienceCard from "../components/ExperienceCard";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function ExperiencePage() {
  const { experience } = usePortfolioData();

  return (
    <>
      <SEO
        title="Experience"
        description="Professional experience timeline for Ayyaj Kalandar Shaikh — Software development internships, MERN stack, and frontend engineering."
      />

      <PageHeader
        badge="CAREER PROGRESSION"
        title="Professional Experience"
        subtitle="Chronological timeline of software engineering internships, technical responsibilities, and industry contributions."
      />

      <div className="timeline">
        {experience.map((item) => (
          <ExperienceCard key={item.id} item={item} />
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
            Need a detailed copy of my work background?
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Download or preview the official PDF resume containing comprehensive experience details.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button to="/resume" variant="primary">
            View Resume →
          </Button>
          <Button to="/contact" variant="outline">
            Get in Touch
          </Button>
        </div>
      </section>
    </>
  );
}
