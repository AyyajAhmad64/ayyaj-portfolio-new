import React, { useState, useEffect } from "react";
import { getSkills, saveSkills } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminSkillsPage() {
  const [skillGroups, setSkillGroups] = useState([]);
  const [notice, setNotice] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [targetCategoryIndex, setTargetCategoryIndex] = useState(0);

  const loadData = async () => {
    const data = await getSkills();
    setSkillGroups(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const updated = [...skillGroups];
    if (updated[targetCategoryIndex]) {
      updated[targetCategoryIndex].skills.push({
        name: newSkillName.trim(),
        level: "Proficient",
        core: false
      });
      await saveSkills(updated);
      setSkillGroups(updated);
      setNewSkillName("");
      setNotice("Skill successfully added.");
      setTimeout(() => setNotice(""), 3000);
    }
  };

  const handleRemoveSkill = async (groupIndex, skillIndex) => {
    const updated = [...skillGroups];
    updated[groupIndex].skills.splice(skillIndex, 1);
    await saveSkills(updated);
    setSkillGroups(updated);
    setNotice("Skill removed.");
    setTimeout(() => setNotice(""), 3000);
  };

  const handleToggleCore = async (groupIndex, skillIndex) => {
    const updated = [...skillGroups];
    const item = updated[groupIndex].skills[skillIndex];
    item.core = !item.core;
    await saveSkills(updated);
    setSkillGroups(updated);
  };

  return (
    <div className="admin-page">
      <SEO title="Manage Skills — Admin CMS" description="Manage technical skills by category." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">TECHNICAL COMPETENCY</span>
          <h1 className="admin-page-title">Skills &amp; Technology Matrix</h1>
          <p className="admin-page-desc">
            Add, categorize, and prioritize programming languages, tools, frameworks, and databases.
          </p>
        </div>
      </div>

      {notice && (
        <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid var(--accent-emerald)", borderRadius: "var(--radius-sm)", color: "var(--accent-emerald)", fontSize: "13px", marginBottom: "20px" }}>
          {notice}
        </div>
      )}

      {/* Add Skill Quick Form */}
      <form onSubmit={handleAddSkill} className="card" style={{ marginBottom: "28px" }}>
        <h2 className="section-title-sm" style={{ marginBottom: "12px" }}>
          Quick Add Technical Skill
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={targetCategoryIndex}
            onChange={(e) => setTargetCategoryIndex(Number(e.target.value))}
            className="admin-input"
            style={{ width: "auto", minWidth: "220px" }}
          >
            {skillGroups.map((g, idx) => (
              <option key={g.category} value={idx}>
                {g.category}
              </option>
            ))}
          </select>

          <input
            type="text"
            required
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Skill name (e.g. Docker, Redis, Kafka)"
            className="admin-input"
            style={{ flex: "1 1 200px" }}
          />

          <Button type="submit" variant="primary" size="sm">
            + Add to Category
          </Button>
        </div>
      </form>

      {/* Skill Groups Grid */}
      <div style={{ display: "grid", gap: "20px" }}>
        {skillGroups.map((group, gIdx) => (
          <div key={group.category} className="card">
            <div className="section-row-header">
              <div>
                <h3 style={{ fontSize: "15px", color: "var(--accent-amber)", margin: 0 }}>
                  {group.category}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{group.description}</span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>
                {group.skills.length} skills
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {group.skills.map((skill, sIdx) => (
                <div
                  key={skill.name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    background: skill.core ? "var(--accent-cyan-soft)" : "var(--bg-base)",
                    border: `1px solid ${skill.core ? "rgba(56, 189, 248, 0.4)" : "var(--border-subtle)"}`,
                    color: skill.core ? "var(--accent-cyan)" : "var(--text-main)",
                    fontSize: "12px"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleCore(gIdx, sIdx)}
                    title={skill.core ? "Core skill (highlighted on Home)" : "Click to set as core skill"}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px" }}
                  >
                    {skill.core ? "★" : "☆"}
                  </button>
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(gIdx, sIdx)}
                    title="Remove skill"
                    style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", marginLeft: "4px" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

