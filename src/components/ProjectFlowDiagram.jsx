import React from "react";

export default function ProjectFlowDiagram({ project }) {
  if (!project) return null;

  // Determine stack-specific node labels
  const isReact = (project.technologies || []).some((t) => t.toLowerCase().includes("react"));
  const isSpring = (project.technologies || []).some((t) => t.toLowerCase().includes("spring") || t.toLowerCase().includes("java"));
  const isDotNet = (project.technologies || []).some((t) => t.toLowerCase().includes("asp") || t.toLowerCase().includes("c#"));
  const isSQL = (project.technologies || []).some((t) => t.toLowerCase().includes("mysql") || t.toLowerCase().includes("sql"));

  const clientLabel = isReact ? "React.js Client" : (project.title + " Frontend");
  const clientSub = isReact ? "State Hooks & Components" : "View Presentation Layer";

  const apiLabel = isSpring ? "REST Controllers" : (isDotNet ? "ASP.NET Endpoints" : "API Interface");
  const apiSub = "HTTP Contracts & Validation";

  const logicLabel = isSpring ? "Spring Service Layer" : (isDotNet ? "Business Domain Layer" : "Domain Services");
  const logicSub = "Business Rules & Transactions";

  const dbLabel = isSQL ? ((project.technologies || []).find((t) => t.toLowerCase().includes("mysql") || t.toLowerCase().includes("sql")) || "Relational Database") : "Data Persistence";
  const dbSub = isSpring ? "JPA / Hibernate ORM" : (isDotNet ? "Entity Framework / ADO" : "Schema Entities");

  const steps = [
    { num: "01", icon: "👤", role: "CLIENT", label: "User Interaction", sub: "Browser Viewport" },
    { num: "02", icon: "💻", role: "FRONTEND", label: clientLabel, sub: clientSub },
    { num: "03", icon: "🔌", role: "API LAYER", label: apiLabel, sub: apiSub },
    { num: "04", icon: "⚙️", role: "BUSINESS LOGIC", label: logicLabel, sub: logicSub },
    { num: "05", icon: "🗄️", role: "STORAGE", label: dbLabel, sub: dbSub }
  ];

  return (
    <section className="project-flow-section" aria-label="System Architecture & Flow">
      <div className="section-head-compact">
        <span className="section-micro-label">SYSTEM ARCHITECTURE</span>
        <h2 className="glance-heading">How It Works</h2>
      </div>

      <div className="flow-diagram-container">
        <div className="flow-steps-grid">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="flow-step-node">
                <div className="flow-node-top">
                  <span className="flow-node-icon" aria-hidden="true">{step.icon}</span>
                  <span className="flow-node-num">{step.num}</span>
                </div>
                <div className="flow-node-role">{step.role}</div>
                <div className="flow-node-label">{step.label}</div>
                <div className="flow-node-sub">{step.sub}</div>
              </div>

              {idx < steps.length - 1 && (
                <div className="flow-connector" aria-hidden="true">
                  <span className="flow-arrow-line" />
                  <span className="flow-arrow-head">→</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

