import React from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import AchievementCard from "../components/AchievementCard";
import SEO from "../components/SEO";

export default function AchievementsPage() {
  const { achievements } = usePortfolioData();

  return (
    <>
      <SEO
        title="Achievements"
        description="Academic milestones and career achievements for Ayyaj Kalandar Shaikh — Postgraduate selections, degrees, and industry recognition."
      />

      <PageHeader
        badge="HONORS &amp; MILESTONES"
        title="Achievements &amp; Selections"
        subtitle="Verified academic milestones, competitive selections, and educational accomplishments."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {achievements.map((item) => (
          <AchievementCard key={item.id} achievement={item} />
        ))}
      </div>
    </>
  );
}
