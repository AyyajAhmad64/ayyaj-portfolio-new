import React from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import EducationCard from "../components/EducationCard";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function EducationPage() {
  const { education } = usePortfolioData();

  return (
    <>
      <SEO
        title="Education"
        description="Academic qualifications of Ayyaj Kalandar Shaikh — Master of Computer Applications (MCA) in Cloud Computing and Bachelor of Computer Applications (BCA)."
      />

      <PageHeader
        badge="ACADEMIC BACKGROUND"
        title="Education &amp; Qualifications"
        subtitle="Formal degrees, academic milestones, and specialized coursework in Cloud Computing, Software Engineering, and Computer Science."
      />

      <div className="timeline">
        {education.map((item) => (
          <EducationCard key={item.id} item={item} />
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
            Academic Credentials &amp; Verification
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            For academic verification or transcripts, please connect via direct contact channels.
          </p>
        </div>
        <Button to="/contact" variant="primary">
          Contact for Inquiries →
        </Button>
      </section>
    </>
  );
}
