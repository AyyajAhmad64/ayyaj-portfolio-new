import React, { useState, useMemo } from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import ProjectFilter from "../components/ProjectFilter";
import ProjectCard from "../components/ProjectCard";
import SEO from "../components/SEO";
import NextPageNavigation from "../components/NextPageNavigation";

export default function ProjectsPage() {
  const { projects } = usePortfolioData();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const cats = new Set(["All"]);
    projects.forEach((p) => {
      if (Array.isArray(p.category)) {
        p.category.forEach((c) => cats.add(c));
      } else if (p.category) {
        cats.add(p.category);
      }
    });
    return Array.from(cats);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return projects.filter((p) => {
      const matchesCategory =
        activeCategory === "All" ||
        (Array.isArray(p.category) && p.category.includes(activeCategory)) ||
        p.category === activeCategory;

      if (!matchesCategory) return false;

      if (!q) return true;

      const titleMatch = (p.title || "").toLowerCase().includes(q);
      const descMatch = (p.description || "").toLowerCase().includes(q);
      const stackMatch = (p.stack || "").toLowerCase().includes(q);
      const techMatch = Array.isArray(p.technologies) && p.technologies.some((t) => t.toLowerCase().includes(q));

      return titleMatch || descMatch || stackMatch || techMatch;
    });
  }, [projects, activeCategory, searchQuery]);

  return (
    <>
      <SEO
        title="Projects"
        description="Software development projects by Ayyaj Kalandar Shaikh — Full stack web platforms, Java Spring Boot backends, React applications, and SQL databases."
      />

      <PageHeader
        badge="SOFTWARE ENGINEERING REPOSITORY"
        title="Engineering Projects"
        subtitle={`Explore ${projects.length} full-stack applications, enterprise backends, and cloud architectures built with layered designs and relational schemas.`}
      />

      <ProjectFilter
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <div style={{ marginBottom: "28px" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by keyword (e.g. Java, Spring Boot, React, MySQL)..."
          className="admin-input"
          style={{
            maxWidth: "480px",
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            fontSize: "13.5px"
          }}
          aria-label="Filter projects by technology or title"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects match your filter</h3>
          <p>
            {searchQuery
              ? `No projects found matching "${searchQuery}" in category "${activeCategory}".`
              : `There are currently no projects categorized under "${activeCategory}".`}
          </p>
          {(activeCategory !== "All" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="btn btn-outline btn-sm"
              style={{ marginTop: "12px" }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((proj) => {
            const originalIndex = projects.findIndex((p) => p.id === proj.id || p.slug === proj.slug);
            const projectNumber = projects.length - (originalIndex !== -1 ? originalIndex : 0);
            return (
              <ProjectCard
                key={proj.id || proj.slug}
                project={proj}
                projectNumber={projectNumber}
              />
            );
          })}
        </div>
      )}

      <NextPageNavigation
        prev={{ label: "Work Experience", to: "/experience" }}
        next={{
          label: "Academic Education",
          to: "/education",
          description: "MCA in Cloud Computing and computer science academic foundation."
        }}
      />
    </>
  );
}
