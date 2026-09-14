import React, { useState } from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import PageHeader from "../components/PageHeader";
import ContactCard from "../components/ContactCard";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function ContactPage() {
  const { profile } = usePortfolioData();
  const contact = profile?.contact || {};
  const [showFullAddress, setShowFullAddress] = useState(false);

  const contactChannels = [
    {
      label: "EMAIL DIRECT",
      value: contact.email || "ayyajshaikh04@gmail.com",
      href: `mailto:${contact.email || "ayyajshaikh04@gmail.com"}`,
      copyValue: contact.email || "ayyajshaikh04@gmail.com",
      actionText: "Compose Email",
      target: "_self"
    },
    {
      label: "PHONE / CALL",
      value: contact.phone || "+91 86695 62899",
      href: `tel:${contact.phoneRaw || "+918669562899"}`,
      copyValue: contact.phone || "+91 86695 62899",
      actionText: "Call Now",
      target: "_self"
    },
    {
      label: "WHATSAPP",
      value: `${contact.phone || "+91 86695 62899"} (${contact.whatsappHandle || "+91 8669562899"})`,
      href: contact.whatsapp || "https://wa.me/918669562899",
      copyValue: contact.phoneRaw || "+918669562899",
      actionText: "Open WhatsApp",
      target: "_blank"
    },
    {
      label: "LINKEDIN PROFILE",
      value: contact.linkedinHandle || "/in/ayyajahmad86",
      href: contact.linkedin || "https://www.linkedin.com/in/ayyajahmad86",
      copyValue: contact.linkedin || "https://www.linkedin.com/in/ayyajahmad86",
      actionText: "Connect on LinkedIn",
      target: "_blank"
    },
    {
      label: "GITHUB PROFILE",
      value: `/${contact.githubHandle || "AyyajAhmad64"}`,
      href: contact.github || "https://github.com/AyyajAhmad64",
      copyValue: contact.github || "https://github.com/AyyajAhmad64",
      actionText: "Browse GitHub",
      target: "_blank"
    },
    {
      label: "LOCATION",
      value: "Hinjawadi, Pune, Maharashtra, India",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Hinjawadi, Pune, Maharashtra, India")}`,
      copyValue: "Hinjawadi, Pune, Maharashtra, India",
      actionText: "View on Google Maps",
      target: "_blank"
    }
  ];

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with Ayyaj Kalandar Shaikh — Direct contact methods via Email, Phone, WhatsApp, LinkedIn, and GitHub."
      />

      <PageHeader
        badge="COMMUNICATION CHANNELS"
        title="Direct Contact"
        subtitle="Direct channels to reach out for software engineering positions, internships, freelance projects, and technical collaborations."
      />

      <div className="contact-grid">
        {contactChannels.map((c) => (
          <ContactCard
            key={c.label}
            label={c.label}
            value={c.value}
            href={c.href}
            copyValue={c.copyValue}
            actionText={c.actionText}
            target={c.target}
          />
        ))}
      </div>

      {contact.fullAddress && (
        <div
          style={{
            marginBottom: "32px",
            padding: "16px 20px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", fontWeight: "700" }}>
                OFFICIAL VERIFICATION / MAILING ADDRESS
              </span>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Need exact premises details for background screening or documentation?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFullAddress((prev) => !prev)}
              className="btn btn-outline btn-sm"
            >
              {showFullAddress ? "Hide Official Details ▲" : "Show Full Official Address ▼"}
            </button>
          </div>

          {showFullAddress && (
            <div
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-subtle)",
                fontSize: "13.5px",
                color: "var(--text-bright)",
                lineHeight: "1.6"
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>
                {contact.fullAddress}
              </div>
              <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(contact.fullAddress);
                    alert("Official full address copied to clipboard.");
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Copy Full Address
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.fullAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-md)",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--accent-emerald)", fontWeight: "bold" }}>●</span>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-cyan)", letterSpacing: "0.03em" }}>
            FAST RESPONSE PROTOCOL
          </span>
        </div>

        <h2 style={{ fontSize: "18px", color: "var(--text-bright)" }}>
          Direct, zero-friction communication
        </h2>

        <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.65", maxWidth: "68ch" }}>
          To ensure reliable delivery without third-party email service dropouts, communications are handled directly through verified channels. You can click to launch an email directly to <strong>{contact.email}</strong> or initiate a conversation via WhatsApp or LinkedIn.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
          <Button href={`mailto:${contact.email}`} variant="primary">
            Send Email via Client ↗
          </Button>
          <Button href={contact.whatsapp} target="_blank" rel="noopener noreferrer" variant="secondary">
            Message on WhatsApp ↗
          </Button>
          <Button href={contact.linkedin} target="_blank" rel="noopener noreferrer" variant="outline">
            Message on LinkedIn ↗
          </Button>
        </div>
      </section>
    </>
  );
}
