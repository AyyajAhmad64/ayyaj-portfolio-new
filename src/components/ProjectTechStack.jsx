import React from "react";

export default function ProjectTechStack({ project }) {
  if (!project || !Array.isArray(project.technologies) || project.technologies.length === 0) {
    return null;
  }

  const rawTechs = project.technologies;

  // Categorization dictionary for standard software stacks
  const categories = {
    Frontend: ["React.js", "React", "JavaScript", "JavaScript (ES6+)", "HTML5", "CSS3", "Bootstrap", "Thymeleaf", "Tailwind CSS"],
    Backend: ["Java", "Spring Boot", "ASP.NET Core", "C#", "Node.js", "Express.js"],
    Database: ["MySQL", "SQL Server", "Microsoft SQL Server", "MongoDB", "Hibernate / JPA", "JPA", "Database Design"],
    APIs: ["REST APIs", "RESTful APIs", "Axios", "Fetch API", "Postman", "API Integration"],
    Tools: ["Git", "GitHub", "Maven", "VS Code", "SSMS", "Layered Architecture"]
  };

  const categorized = {
    Frontend: [],
    Backend: [],
    Database: [],
    APIs: [],
    Tools: []
  };

  const assigned = new Set();

  // Assign technologies to respective groups
  rawTechs.forEach((t) => {
    let found = false;
    for (const [cat, items] of Object.entries(categories)) {
      if (items.some((i) => i.toLowerCase() === t.toLowerCase())) {
        categorized[cat].push(t);
        assigned.add(t);
        found = true;
        break;
      }
    }
    // Fallback classification if not matched in dictionary
    if (!found) {
      if (t.toLowerCase().includes("sql") || t.toLowerCase().includes("db")) {
        categorized.Database.push(t);
      } else if (t.toLowerCase().includes("api")) {
        categorized.APIs.push(t);
      } else {
        categorized.Tools.push(t);
      }
      assigned.add(t);
    }
  });

  // Filter out empty groups so we ONLY display technologies actually present
  const activeGroups = Object.entries(categorized).filter(([, list]) => list.length > 0);

  return (
    <section className="project-tech-section" aria-label="Technology Stack">
      <div className="section-head-compact">
        <span className="section-micro-label">ENGINEERING STACK</span>
        <h2 className="glance-heading">Technologies &amp; Tools</h2>
      </div>

      <div className="tech-groups-grid">
        {activeGroups.map(([groupName, techList]) => (
          <div key={groupName} className="tech-group-card">
            <div className="tech-group-header">
              <span className="tech-group-dot" />
              <span className="tech-group-name">{groupName}</span>
              <span className="tech-group-count">{techList.length}</span>
            </div>

            <div className="tech-badges-list">
              {techList.map((tech) => (
                <span key={tech} className="tech-badge-item">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

