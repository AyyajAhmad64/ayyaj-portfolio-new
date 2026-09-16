import React, { useState } from "react";
import Button from "./Button";

export default function CertificationCard({ cert }) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (!cert.credentialId) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cert.credentialId);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const certImage = cert.image || (cert.certificateUrl && /\.(png|jpe?g|webp|gif|svg)$/i.test(cert.certificateUrl) ? cert.certificateUrl : null);

  return (
    <article className="card" aria-label={cert.name}>
      {/* Visual Thumbnail: Image or Designed Credential Seal Panel */}
      <div className="showcase-thumb-panel">
        {certImage ? (
          <img src={certImage} alt={cert.name} className="showcase-thumb-img" />
        ) : (
          <div className="credential-preview-panel">
            <div className="credential-preview-top">
              <span className="credential-preview-badge">VERIFIED CREDENTIAL</span>
              <span className="credential-preview-status">● VERIFIED</span>
            </div>
            <div className="credential-preview-body">
              <div className="credential-seal-icon">📜</div>
              <div className="credential-preview-info">
                <div className="credential-preview-name" title={cert.name}>{cert.name}</div>
                <div className="credential-preview-issuer">{cert.issuer}</div>
              </div>
            </div>
            <div className="credential-preview-footer">
              <span>{cert.credentialId ? `ID: ${cert.credentialId.slice(0, 16)}...` : "TECHNICAL QUALIFICATION"}</span>
              <span>{cert.date}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
          CERTIFICATION
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{cert.date}</span>
      </div>

      <h3 className="card-title" style={{ marginBottom: "6px" }}>{cert.name}</h3>

      <div style={{ color: "var(--accent-amber)", fontSize: "13px", fontWeight: "600", marginBottom: "10px" }}>
        Issued by: {cert.issuer}
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "13.5px", lineHeight: "1.6", marginBottom: "16px" }}>
        {cert.description}
      </p>

      {cert.skills && cert.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
          {cert.skills.map((s) => (
            <span
              key={s}
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "9999px",
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-main)"
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {cert.credentialId && (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-dim)",
            marginBottom: "14px",
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
            boxSizing: "border-box",
            background: "rgba(15, 23, 42, 0.4)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Credential ID
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              style={{
                background: copied ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                border: copied ? "1px solid var(--accent-emerald)" : "1px solid var(--border-subtle)",
                borderRadius: "4px",
                color: copied ? "var(--accent-emerald)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: "11px",
                padding: "2px 8px",
                fontFamily: "var(--font-mono)",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
              title="Copy Credential ID to clipboard"
              aria-label="Copy Credential ID"
            >
              {copied ? "✓ Copied!" : "📋 Copy ID"}
            </button>
          </div>
          <span
            style={{
              color: "var(--text-main)",
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
              lineHeight: "1.5",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              maxWidth: "100%",
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              userSelect: "all"
            }}
          >
            {cert.credentialId}
          </span>
        </div>
      )}

      <div style={{ marginTop: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
        {cert.verificationUrl ? (
          <Button href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
            Verify Credential ↗
          </Button>
        ) : (
          <span style={{ fontSize: "11px", color: "var(--accent-emerald)", fontWeight: "600" }}>
            ● Verified Completion
          </span>
        )}
      </div>
    </article>
  );
}

