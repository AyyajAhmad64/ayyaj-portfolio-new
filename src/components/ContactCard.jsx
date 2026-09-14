import React, { useState } from "react";
import { copyToClipboard } from "../utils/helpers";
import Button from "./Button";

export default function ContactCard({
  label,
  value,
  addressLines,
  href,
  copyValue,
  actionText,
  target = "_blank"
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyValue) return;
    const ok = await copyToClipboard(copyValue);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="contact-card">
      <div className="contact-card-top">
        <span className="contact-label">{label}</span>
        {copyValue && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleCopy}
            style={{
              padding: "2px 8px",
              fontSize: "11px",
              color: copied ? "var(--accent-amber)" : "var(--accent-cyan)",
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)"
            }}
            aria-label={`Copy ${label}`}
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        )}
      </div>

      <div className="contact-value" style={{ minWidth: 0, wordBreak: "break-word" }}>
        {addressLines && addressLines.length > 0 ? (
          <div style={{ display: "grid", gap: "2px", lineHeight: "1.55", fontSize: "13.5px" }}>
            {addressLines.map((line, idx) => (
              <span key={idx} style={{ color: "var(--text-bright)", display: "block" }}>
                {line}
              </span>
            ))}
          </div>
        ) : href ? (
          <a
            href={href}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
          >
            {value}
          </a>
        ) : (
          <span>{value}</span>
        )}
      </div>

      {href && (
        <div style={{ marginTop: "8px" }}>
          <Button
            href={href}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
            variant="outline"
            size="sm"
          >
            {actionText || "Connect"} →
          </Button>
        </div>
      )}
    </div>
  );
}
