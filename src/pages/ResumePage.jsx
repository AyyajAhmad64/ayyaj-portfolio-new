import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import { fetchActiveResumeVersion, logAnalyticsEvent } from "../services/supabaseService";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function ResumePage() {
  const { profile } = usePortfolioData();
  const contact = profile?.contact || {};

  const [activeResume, setActiveResume] = useState(null);

  // Fetch the active resume version from Supabase Storage
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchActiveResumeVersion().then((v) => {
        if (v?.public_url || v?.file_url) setActiveResume(v);
      });
    }
    logAnalyticsEvent("resume_view", "/resume", {});
  }, []);

  // Prefer Supabase-hosted active resume, then profile contact link, then static fallback
  const resolvedUrl =
    activeResume?.public_url ||
    activeResume?.file_url ||
    contact.resumePdf ||
    "/Ayyaj Kalandar Shaikh - Resume.pdf";

  const resolvedFileName =
    activeResume?.file_name ||
    contact.resumePdfName ||
    "Ayyaj Kalandar Shaikh - Resume.pdf";

  const pdfUrl = resolvedUrl.startsWith("http")
    ? resolvedUrl
    : `/${encodeURIComponent(resolvedUrl)}`;

  return (
    <>
      <SEO
        title="Resume"
        description="Official resume and curriculum vitae for Ayyaj Kalandar Shaikh — Full Stack Developer & Cloud Computing (MCA)."
      />

      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--accent-cyan)",
            fontWeight: "600"
          }}
        >
          ← Back to Portfolio
        </Link>
      </div>

      <PageHeader
        badge="CURRICULUM VITAE"
        title="Official Resume"
        subtitle="Software engineering qualifications, Java and Spring Boot backends, React engineering, cloud infrastructure focus, and chronological internship records."
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          marginBottom: "28px"
        }}
      >
        <div>
          <div style={{ fontSize: "14.5px", fontWeight: "700", color: "var(--text-bright)" }}>
            {resolvedFileName}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
            Format: Standard PDF Document · Verified for Software Engineering &amp; Cloud Opportunities
            {activeResume?.version && (
              <span style={{ marginLeft: "8px", color: "var(--accent-emerald)" }}>
                · {activeResume.version}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button
            href={pdfUrl}
            download={resolvedFileName}
            variant="primary"
            onClick={() => logAnalyticsEvent("resume_download", "/resume", {})}
          >
            Download Resume (PDF) ↓
          </Button>

          <Button
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
          >
            Open Full PDF ↗
          </Button>

          {contact.resumeDrive && (
            <Button
              href={contact.resumeDrive}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
            >
              Google Drive ↗
            </Button>
          )}
        </div>
      </div>

      <section className="resume-viewer-card" aria-label="Resume Document Preview">
        <div className="resume-viewer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--accent-emerald)" }}>●</span>
            <span>Document Preview: {resolvedFileName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>A4 Standard</span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-cyan)", fontSize: "12px" }}
            >
              Pop-out Viewer ↗
            </a>
          </div>
        </div>

        <div className="resume-frame-wrap">
          <iframe
            src={`${pdfUrl}#view=FitH`}
            title="Ayyaj Kalandar Shaikh - Official Resume Preview"
            className="resume-a4-frame"
          />
        </div>
      </section>

      <div
        style={{
          padding: "20px 24px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div>
          <div style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-bright)" }}>
            Need an offline copy or mobile view?
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Download the official PDF directly to your device or review chronological details under Experience and Education.
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button to="/experience" variant="outline" size="sm">
            View Experience →
          </Button>
          <Button
            href={pdfUrl}
            download={resolvedFileName}
            variant="primary"
            size="sm"
            onClick={() => logAnalyticsEvent("resume_download", "/resume", {})}
          >
            Download PDF File ↓
          </Button>
        </div>
      </div>
    </>
  );
}
