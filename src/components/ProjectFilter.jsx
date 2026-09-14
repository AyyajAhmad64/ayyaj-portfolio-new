import React from "react";

export default function ProjectFilter({ categories, activeCategory, onSelectCategory }) {
  if (!categories || categories.length <= 1) return null;

  return (
    <div className="filter-bar" role="tablist" aria-label="Filter projects by category">
      {categories.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`filter-btn ${isActive ? "active" : ""}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

