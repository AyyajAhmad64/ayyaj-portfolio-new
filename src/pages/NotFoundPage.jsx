import React from "react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function NotFoundPage() {
  return (
    <>
      <SEO
        title="404 — Page Not Found"
        description="The requested page could not be found on Ayyaj Kalandar Shaikh's developer platform."
      />

      <div className="empty-state" style={{ padding: "64px 24px" }}>
        <span className="page-badge" style={{ color: "var(--accent-amber)", borderColor: "rgba(245, 158, 11, 0.3)" }}>
          HTTP 404
        </span>
        <h1 style={{ fontSize: "28px", color: "var(--text-bright)", margin: "12px 0 8px" }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "48ch", margin: "0 auto 24px" }}>
          The path you requested does not exist on this platform or has been relocated.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Button to="/" variant="primary">
            Return Home →
          </Button>
          <Button to="/projects" variant="outline">
            Browse Projects
          </Button>
          <Button to="/contact" variant="ghost">
            Contact Me
          </Button>
        </div>
      </div>
    </>
  );
}

