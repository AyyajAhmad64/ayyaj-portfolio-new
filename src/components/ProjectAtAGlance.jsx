import React from "react";

export default function ProjectAtAGlance({ project }) {
  if (!project) return null;

  // Curated project-specific highlights or dynamic feature derivation
  const getGlanceCards = () => {
    if (Array.isArray(project.glanceCards) && project.glanceCards.length > 0) {
      return project.glanceCards;
    }

    if (project.slug === "nexora" || project.id === "nexora") {
      return [
        { icon: "🛍️", title: "Product Experience", desc: "Catalog browsing with real-time category filtering and search." },
        { icon: "🛒", title: "Shopping Cart", desc: "Persistent cart state, quantity controls, and total calculations." },
        { icon: "🔐", title: "Authentication", desc: "Protected routing, login state handling, and checkout preparation." },
        { icon: "📱", title: "Responsive UI", desc: "Mobile-first ergonomic layout tailored for smooth multi-device use." },
        { icon: "⚡", title: "REST Integration", desc: "Asynchronous communication with decoupled backend endpoints." }
      ];
    }

    if (project.slug === "silent-help" || project.id === "silent-help") {
      return [
        { icon: "📋", title: "Request Lifecycle", desc: "Full CRUD tracking for community requests and status management." },
        { icon: "🏛️", title: "Layered Spring Architecture", desc: "Strict Controller-Service-Repository separation of concerns." },
        { icon: "🗄️", title: "Relational Persistence", desc: "MySQL schema managed via Hibernate/JPA entity mapping." },
        { icon: "🛡️", title: "Data Integrity", desc: "Transactional boundaries and server-side request validation." }
      ];
    }

    if (project.slug === "bca-notes-hub" || project.id === "bca-notes-hub") {
      return [
        { icon: "📚", title: "Academic Resource Hub", desc: "Organized repository for course notes, syllabi, and study files." },
        { icon: "🗄️", title: "SQL Server Storage", desc: "Normalized relational schemas enabling fast resource queries." },
        { icon: "🔍", title: "Semester Taxonomy", desc: "Multi-criteria indexing categorized by academic year and subject." },
        { icon: "💻", title: "Cross-Device Web Portal", desc: "Clean responsive interface built with ASP.NET Core & Bootstrap." }
      ];
    }

    // Dynamic extraction from project.features or stack
    const iconList = ["⚡", "⚙️", "🗄️", "📱", "🛡️", "🌐"];
    const features = Array.isArray(project.features) ? project.features.slice(0, 4) : [];

    if (features.length > 0) {
      return features.map((feat, idx) => {
        const parts = feat.split(" - ");
        const title = parts.length > 1 ? parts[0] : feat.slice(0, 28) + (feat.length > 28 ? "..." : "");
        const desc = parts.length > 1 ? parts[1] : feat;
        return {
          icon: iconList[idx % iconList.length],
          title,
          desc
        };
      });
    }

    return [
      { icon: "⚡", title: "Core Execution", desc: project.type || "Full Stack Application" },
      { icon: "⚙️", title: "Technology Stack", desc: project.stack || "Layered Architecture" }
    ];
  };

  const cards = getGlanceCards();

  return (
    <section className="project-glance-section" aria-label="Project At a Glance">
      <div className="section-head-compact">
        <span className="section-micro-label">AT A GLANCE</span>
        <h2 className="glance-heading">What I Built</h2>
      </div>

      <p className="glance-summary-text">{project.description}</p>

      <div className="glance-cards-grid">
        {cards.map((card, idx) => (
          <div key={idx} className="glance-card">
            <span className="glance-card-icon" aria-hidden="true">{card.icon}</span>
            <h3 className="glance-card-title">{card.title}</h3>
            <p className="glance-card-desc">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

