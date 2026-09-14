import React from "react";

export default function ProjectSnapshot({ project }) {
  if (!project) return null;

  const items = [
    { label: "TYPE", value: project.type },
    { label: "STATUS", value: project.status, isStatus: true },
    { label: "STACK", value: project.stack },
    { label: "ROLE", value: project.role },
    { label: "YEAR", value: project.year },
    { label: "DEVELOPMENT STAGE", value: project.stage || project.developmentStage }
  ].filter((item) => Boolean(item.value));

  if (items.length === 0) return null;

  const isDev = project.status && project.status.toLowerCase().includes("development");
  const statusClass = isDev ? "in-development" : "completed";

  return (
    <section className="project-snapshot-strip" aria-label="Quick Project Snapshot">
      {items.map((item) => (
        <div key={item.label} className="snapshot-strip-item">
          <span className="snapshot-strip-label">{item.label}</span>
          {item.isStatus ? (
            <span className={`project-status ${statusClass} snapshot-status-pill`}>
              {item.value}
            </span>
          ) : (
            <span className="snapshot-strip-value">{item.value}</span>
          )}
        </div>
      ))}
    </section>
  );
}

