import React, { useState, useMemo } from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import ProjectFilter from "../components/ProjectFilter";
import GalleryGrid from "../components/GalleryGrid";
import SEO from "../components/SEO";

export default function GalleryPage() {
  const { gallery } = usePortfolioData();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(["All"]);
    gallery.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [gallery]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return gallery;
    return gallery.filter((item) => item.category === activeCategory);
  }, [gallery, activeCategory]);

  return (
    <>
      <SEO
        title="Gallery"
        description="Visual development showcase and interface architecture audit gallery for Ayyaj Kalandar Shaikh's engineering work."
      />

      <PageHeader
        badge="VISUAL ARCHIVE"
        title="Development &amp; Interface Gallery"
        subtitle="Visual inspections, architecture audits, and screenshots of responsive development workflows and user interfaces."
      />

      <ProjectFilter
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <GalleryGrid items={filteredItems} />
    </>
  );
}
