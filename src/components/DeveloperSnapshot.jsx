import React from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";

export default function DeveloperSnapshot({ customData }) {
  const { profile } = usePortfolioData();
  const snapshot = customData || profile?.snapshot || {};

  return (
    <section className="focus-panel" aria-label="Current Focus and Developer Status">
      <div className="focus-panel-header">
        <div className="focus-panel-title">
          <span className="focus-panel-indicator" aria-hidden="true" />
          <h3>Current Focus</h3>
        </div>
        <span className="focus-panel-badge">ENGINEERING STATUS</span>
      </div>

      <div className="focus-grid">
        <div className="focus-row">
          <span className="focus-label">CURRENT ROLE</span>
          <span className="focus-value role-value">
            {snapshot.currentPosition || profile?.currentRole || "MERN Stack + AI Intern"}
          </span>
        </div>

        <div className="focus-row">
          <span className="focus-label">PRIMARY STACK</span>
          <span className="focus-value stack-value">
            {snapshot.backend || "Java / Spring Boot"} • {snapshot.frontend || "React.js"}
          </span>
        </div>

        <div className="focus-row">
          <span className="focus-label">CLOUD INFRASTRUCTURE</span>
          <span className="focus-value">
            {snapshot.cloud || "Cloud Computing / AWS Fundamentals"}
          </span>
        </div>

        <div className="focus-row">
          <span className="focus-label">DATABASES</span>
          <span className="focus-value">
            {snapshot.databases || "MySQL / SQL Server / MongoDB"}
          </span>
        </div>

        <div className="focus-row">
          <span className="focus-label">ACADEMIC PROGRAM</span>
          <span className="focus-value">
            {snapshot.academicProgram || (profile?.educationDegree ? `${profile.educationDegree} (${profile.educationSpecialization || ""})` : "MCA — Cloud Computing (D. Y. Patil Pune)")}
          </span>
        </div>

        <div className="focus-row">
          <span className="focus-label">LOCATION</span>
          <span className="focus-value">
            {snapshot.location || profile?.location || "Pune, Maharashtra, India"}
          </span>
        </div>
      </div>
    </section>
  );
}
