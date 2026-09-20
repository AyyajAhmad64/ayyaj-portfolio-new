import React from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import AchievementCard from "../components/AchievementCard";
import SEO from "../components/SEO";
import NextPageNavigation from "../components/NextPageNavigation";

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "20px" }}>
        {achievements.map((item) => (
          <AchievementCard key={item.id} achievement={item} />
        ))}
      </div>

      <NextPageNavigation
        prev={{ label: "Academic Education", to: "/education" }}
        next={{
          label: "Certifications",
          to: "/certifications",
          description: "Explore verified technical credentials, cloud licenses, and training programs."
        }}
      />
    </>
  );
}
