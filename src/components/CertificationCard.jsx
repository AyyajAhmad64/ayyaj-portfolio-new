import React from "react";
import Button from "./Button";

export default function CertificationCard({ cert }) {
  return (
    <article className="card" aria-label={cert.name}>
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
        <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "12px" }}>
          Credential ID: <span style={{ color: "var(--text-main)", fontFamily: "var(--font-mono)" }}>{cert.credentialId}</span>
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

