import React from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import CertificationCard from "../components/CertificationCard";
import SEO from "../components/SEO";

export default function CertificationsPage() {
  const { certifications } = usePortfolioData();

  return (
    <>
      <SEO
        title="Certifications"
        description="Professional certifications and credentials held by Ayyaj Kalandar Shaikh — Full stack web development, MERN stack, and software engineering credentials."
      />

      <PageHeader
        badge="CREDENTIALS &amp; LICENSES"
        title="Certifications &amp; Training"
        subtitle="Verified credentials, structured technical training programs, and software development certificates."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {certifications.map((cert) => (
          <CertificationCard key={cert.id} cert={cert} />
        ))}
      </div>
    </>
  );
}
