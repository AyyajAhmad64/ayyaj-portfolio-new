import React from "react";

export default function ProjectKeyFeatures({ project }) {
  if (!project || !Array.isArray(project.features) || project.features.length === 0) {
    return null;
  }

  const featureIcons = ["📦", "⚡", "🔐", "📱", "🔄", "🛡️", "📊", "🎯"];

  // Parse each feature string into a clean title + short description
  const parsedFeatures = project.features.map((feat, idx) => {
    let title = "";
    let desc = "";

    if (feat.includes(" - ")) {
      const parts = feat.split(" - ");
      title = parts[0].trim();
      desc = parts.slice(1).join(" - ").trim();
    } else if (feat.includes(" with ")) {
      const parts = feat.split(" with ");
      title = parts[0].trim();
      desc = "With " + parts.slice(1).join(" with ").trim();
    } else if (feat.includes(" and ")) {
      const words = feat.split(" ");
      title = words.slice(0, 4).join(" ");
      desc = feat;
    } else {
      const words = feat.split(" ");
      title = words.slice(0, 3).join(" ");
      desc = feat;
    }

    return {
      icon: featureIcons[idx % featureIcons.length],
      title: title.length > 36 ? title.slice(0, 34) + "..." : title,
      desc
    };
  });

  return (
    <section className="project-features-section" aria-label="Key Implemented Features">
      <div className="section-head-compact">
        <span className="section-micro-label">CAPABILITIES & DELIVERABLES</span>
        <h2 className="glance-heading">Key Features</h2>
      </div>

      <div className="features-cards-grid">
        {parsedFeatures.map((feat, idx) => (
          <div key={idx} className="feature-card">
            <div className="feature-card-header">
              <span className="feature-icon" aria-hidden="true">{feat.icon}</span>
              <span className="feature-num">0{idx + 1}</span>
            </div>
            <h3 className="feature-title">{feat.title}</h3>
            <p className="feature-desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

