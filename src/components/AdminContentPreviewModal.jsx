import React, { useState, useEffect } from "react";

export default function AdminContentPreviewModal({
  isOpen,
  onClose,
  type = "project", // 'project' | 'certification' | 'achievement' | 'gallery' | 'featured'
  data = {}
}) {
  const [viewport, setViewport] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* Top Banner: PREVIEW MODE (DRAFT) */}
      <header
        style={{
          background: "linear-gradient(90deg, #1e1b4b, #0f172a, #1e1b4b)",
          borderBottom: "1px solid var(--accent-cyan)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              background: "var(--accent-amber, #f59e0b)",
              color: "#000",
              fontSize: "11px",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "4px",
              letterSpacing: "0.08em",
              fontFamily: "var(--font-mono, monospace)"
            }}
          >
            PREVIEW MODE
          </span>
          <span id="preview-modal-title" style={{ fontSize: "13px", color: "var(--text-bright, #fff)", fontWeight: 600 }}>
            In-Memory Editor State (Unpublished Draft)
          </span>
        </div>

        {/* Viewport controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            className={`btn btn-sm ${viewport === "desktop" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setViewport("desktop")}
            style={{ fontSize: "12px", padding: "4px 10px" }}
          >
            🖥 Desktop
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewport === "tablet" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setViewport("tablet")}
            style={{ fontSize: "12px", padding: "4px 10px" }}
          >
            📱 Tablet
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewport === "mobile" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setViewport("mobile")}
            style={{ fontSize: "12px", padding: "4px 10px" }}
          >
            📲 Mobile
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ borderColor: "var(--accent-cyan)", color: "var(--accent-cyan)", fontSize: "12px" }}
          >
            ← Back to Editor (Esc)
          </button>
        </div>
      </header>

      {/* Main Preview Frame */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          background: "rgba(10, 15, 29, 0.7)"
        }}
      >
        <div
          style={{
            width: getViewportWidth(),
            maxWidth: "100%",
            transition: "width 0.25s ease-out",
            background: "var(--bg-base, #0b1120)",
            borderRadius: "var(--radius-lg, 12px)",
            border: "1px solid var(--border-subtle, #1e293b)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            padding: "24px",
            minHeight: "400px"
          }}
        >
          {type === "project" && <ProjectPreview data={data} />}
          {type === "certification" && <CertificationPreview data={data} />}
          {type === "achievement" && <AchievementPreview data={data} />}
          {type === "gallery" && <GalleryPreview data={data} />}
          {type === "featured" && <FeaturedPreview data={data} />}
        </div>
      </div>
    </div>
  );
}

function ProjectPreview({ data }) {
  const techs = Array.isArray(data.technologies)
    ? data.technologies
    : (data.techStr ? data.techStr.split(",").map((s) => s.trim()).filter(Boolean) : []);
  const features = Array.isArray(data.features)
    ? data.features
    : (data.featuresStr ? data.featuresStr.split("\n").map((s) => s.trim()).filter(Boolean) : []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            {data.type || "Full Stack Application"} • {data.status || "In Development"}
          </span>
          <h1 style={{ fontSize: "26px", color: "var(--text-bright, #fff)", margin: "4px 0 8px", fontWeight: 700 }}>
            {data.title || "Untitled Project"}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted, #94a3b8)", lineHeight: 1.6 }}>
            {data.description || "No description provided."}
          </p>
        </div>

        {data.thumbnail && (
          <img
            src={data.thumbnail}
            alt={data.title}
            style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
      </div>

      {techs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "16px 0" }}>
          {techs.map((t, idx) => (
            <span
              key={idx}
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                background: "rgba(56, 189, 248, 0.1)",
                color: "var(--accent-cyan)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                padding: "3px 8px",
                borderRadius: "4px"
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {features.length > 0 && (
        <div style={{ margin: "20px 0" }}>
          <h4 style={{ fontSize: "14px", color: "var(--text-bright)", marginBottom: "8px" }}>Key Features</h4>
          <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
            {features.map((f, idx) => (
              <li key={idx}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        {data.liveDemo && (
          <a
            href={data.liveDemo}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
            style={{ fontSize: "12px" }}
          >
            Live Demonstration ↗
          </a>
        )}
        {data.github && (
          <a
            href={data.github}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
            style={{ fontSize: "12px" }}
          >
            GitHub Repository ↗
          </a>
        )}
      </div>
    </div>
  );
}

function CertificationPreview({ data }) {
  const skills = Array.isArray(data.skills)
    ? data.skills
    : (data.skillsStr ? data.skillsStr.split(",").map((s) => s.trim()).filter(Boolean) : []);

  return (
    <div style={{ padding: "16px" }}>
      <span style={{ fontSize: "11px", color: "var(--accent-emerald)", fontFamily: "var(--font-mono)" }}>
        {data.issuer || "Issuing Organization"} • {data.date || "Issued"}
      </span>
      <h2 style={{ fontSize: "22px", color: "var(--text-bright)", margin: "6px 0 10px", fontWeight: 700 }}>
        {data.name || data.title || "Certification Name"}
      </h2>
      {data.credentialId && (
        <p style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
          ID: {data.credentialId}
        </p>
      )}
      <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, margin: "12px 0" }}>
        {data.description || "Credential details and skills verification."}
      </p>

      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "16px" }}>
          {skills.map((s, idx) => (
            <span
              key={idx}
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                background: "rgba(16, 185, 129, 0.1)",
                color: "var(--accent-emerald)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {data.verificationUrl && (
        <div style={{ marginTop: "20px" }}>
          <a
            href={data.verificationUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
            style={{ fontSize: "12px" }}
          >
            Verify Credential ↗
          </a>
        </div>
      )}
    </div>
  );
}

function AchievementPreview({ data }) {
  return (
    <div style={{ padding: "16px" }}>
      <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}>
        🏆 {data.category || data.type || "Milestone"} • {data.organization} • {data.date}
      </span>
      <h2 style={{ fontSize: "22px", color: "var(--text-bright)", margin: "8px 0 12px", fontWeight: 700 }}>
        {data.title || "Achievement Title"}
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
        {data.description || "Achievement description and impact summary."}
      </p>
      {data.metric && (
        <div style={{ marginTop: "16px", padding: "10px 14px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "6px", display: "inline-block" }}>
          <span style={{ fontSize: "13px", color: "var(--accent-amber)", fontWeight: 700 }}>
            {data.metric}
          </span>
        </div>
      )}
    </div>
  );
}

function GalleryPreview({ data }) {
  const imgSrc = data.src || data.thumbnail || data.url || data.imageUrl;
  return (
    <div style={{ padding: "16px" }}>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={data.title || "Gallery image"}
          style={{ width: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <div style={{ height: "180px", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", marginBottom: "16px", color: "var(--text-dim)" }}>
          No Image Source Selected
        </div>
      )}
      <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
        {data.category || "General"} • {data.date || "2026"}
      </span>
      <h2 style={{ fontSize: "20px", color: "var(--text-bright)", margin: "6px 0 8px", fontWeight: 700 }}>
        {data.title || "Gallery Item"}
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
        {data.description || "Visual asset or snapshot description."}
      </p>
    </div>
  );
}

function FeaturedPreview({ data }) {
  return (
    <div style={{ padding: "20px", border: "1px solid var(--accent-cyan)", borderRadius: "8px", background: "rgba(56, 189, 248, 0.05)" }}>
      <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
        FEATURED SPOTLIGHT ITEM
      </span>
      <h3 style={{ fontSize: "20px", color: "var(--text-bright)", margin: "8px 0" }}>
        {data.title || "Featured Title"}
      </h3>
      <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
        {data.description || "Featured item description."}
      </p>
    </div>
  );
}

