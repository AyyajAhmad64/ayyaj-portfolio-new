import React from "react";

export default function SkillGroup({ group }) {
  const isCore = group.category.includes("CORE");

  return (
    <article className={`skill-card ${isCore ? "is-core" : ""}`} aria-label={group.category}>
      <div className="skill-card-top">
        <h3 className="skill-category">{group.category}</h3>
        {group.badge && <span className="skill-card-badge">{group.badge}</span>}
      </div>

      {group.description && <p className="skill-card-desc">{group.description}</p>}

      <div className="skill-chips">
        {group.skills.map((skill) => (
          <span
            key={skill.name}
            className={`skill-chip ${skill.core ? "core-item" : ""}`}
            title={skill.level ? `Proficiency: ${skill.level}` : undefined}
          >
            {skill.name}
          </span>
        ))}
      </div>
    </article>
  );
}

