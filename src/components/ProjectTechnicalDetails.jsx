import React, { useState } from "react";

export default function ProjectTechnicalDetails({ project }) {
  if (!project) return null;

  // Gather existing long-form information
  const sections = [
    {
      id: "challenge",
      title: "The Problem & Challenge Context",
      badge: "PROBLEM FORMULATION",
      color: "var(--accent-amber)",
      content: project.problem || project.challenge
    },
    {
      id: "solution",
      title: "Engineering Solution & Technical Approach",
      badge: "IMPLEMENTATION",
      color: "var(--accent-cyan)",
      content: project.solution
    },
    {
      id: "architecture",
      title: "System Architecture & Layering Pattern",
      badge: "SYSTEM DESIGN",
      color: "var(--accent-cyan)",
      content: project.architecture
    },
    {
      id: "challenges",
      title: "Technical Challenges Overcome",
      badge: "EDGE CASES & TRADEOFFS",
      color: "var(--accent-amber)",
      content: project.challenges || project.technicalChallenges
    },
    {
      id: "learnings",
      title: "Key Engineering Learnings & Takeaways",
      badge: "GROWTH & RETROSPECTIVE",
      color: "var(--accent-emerald)",
      content: project.learnings
    }
  ].filter((sec) => Boolean(sec.content));

  if (sections.length === 0) return null;

  // Track expanded state for each accordion item (collapsed by default)
  const [expandedMap, setExpandedMap] = useState({});

  const toggleSection = (id) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all = {};
    sections.forEach((s) => { all[s.id] = true; });
    setExpandedMap(all);
  };

  const collapseAll = () => {
    setExpandedMap({});
  };

  const isAnyExpanded = Object.values(expandedMap).some(Boolean);

  return (
    <section className="project-technical-details-section" aria-label="Technical Specifications">
      <div className="section-head-with-actions">
        <div>
          <span className="section-micro-label">IN-DEPTH ENGINEERING</span>
          <h2 className="glance-heading">Technical Details</h2>
          <p className="technical-details-subhead">
            Expandable architectural specifications, trade-offs, and engineering implementation notes.
          </p>
        </div>

        <div className="accordion-toggle-btns">
          {isAnyExpanded ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={collapseAll}
              aria-label="Collapse all technical sections"
            >
              Collapse All ▲
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={expandAll}
              aria-label="Expand all technical sections"
            >
              Expand All ▼
            </button>
          )}
        </div>
      </div>

      <div className="accordion-container" role="tablist">
        {sections.map((sec, idx) => {
          const isOpen = Boolean(expandedMap[sec.id]);
          return (
            <div key={sec.id} className={`accordion-item ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="accordion-header"
                onClick={() => toggleSection(sec.id)}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${sec.id}`}
                id={`accordion-btn-${sec.id}`}
              >
                <span className="accordion-caret" aria-hidden="true">
                  {isOpen ? "▾" : "▸"}
                </span>

                <span className="accordion-item-num">0{idx + 1}</span>

                <div className="accordion-title-block">
                  <span className="accordion-badge" style={{ color: sec.color }}>
                    {sec.badge}
                  </span>
                  <span className="accordion-title">{sec.title}</span>
                </div>

                <span className="accordion-hint-pill">
                  {isOpen ? "Close" : "Inspect Details"}
                </span>
              </button>

              {isOpen && (
                <div
                  id={`accordion-content-${sec.id}`}
                  className="accordion-content"
                  role="region"
                  aria-labelledby={`accordion-btn-${sec.id}`}
                >
                  <p className="accordion-text">{sec.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

