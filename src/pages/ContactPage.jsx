import React, { useState } from "react";
import { usePortfolioData } from "../context/PortfolioDataContext";
import { submitContactMessage, logAnalyticsEvent } from "../services/supabaseService";
import PageHeader from "../components/PageHeader";
import ContactCard from "../components/ContactCard";
import Button from "../components/Button";
import SEO from "../components/SEO";

export default function ContactPage() {
  const { profile } = usePortfolioData();
  const contact = profile?.contact || {};

  // Inbound message form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitStatus, setSubmitStatus] = useState("idle"); // 'idle' | 'submitting' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    setSubmitStatus("submitting");
    setStatusMessage("");

    try {
      const res = await submitContactMessage(formData);
      if (res.success) {
        setSubmitStatus("success");
        setStatusMessage(`Thank you, ${formData.name}! Your message has been sent directly to my inbox. I will reply shortly.`);
        setFormData({ name: "", email: "", subject: "", message: "" });
        logAnalyticsEvent("contact_click", "/contact", { action: "submit_message" });
      } else {
        setSubmitStatus("error");
        setStatusMessage(
          res.reason === "unconfigured"
            ? `Cloud inbox is initializing. Please send directly to ${contact.email || "ayyajahmad64@gmail.com"} or via WhatsApp!`
            : (res.error || "Failed to transmit message. Please contact directly via email.")
        );
      }
    } catch (err) {
      setSubmitStatus("error");
      setStatusMessage("An unexpected error occurred. Please contact me via direct email or WhatsApp.");
    }
  };

  const contactChannels = [
    {
      label: "EMAIL DIRECT",
      value: contact.email || "ayyajahmad64@gmail.com",
      href: `mailto:${contact.email || "ayyajahmad64@gmail.com"}`,
      copyValue: contact.email || "ayyajahmad64@gmail.com",
      actionText: "Compose Email",
      target: "_self"
    },
    {
      label: "PHONE / CALL",
      value: contact.phone || "+91 84324 85204",
      href: `tel:${contact.phoneRaw || "+918432485204"}`,
      copyValue: contact.phone || "+91 84324 85204",
      actionText: "Call Now",
      target: "_self"
    },
    {
      label: "WHATSAPP",
      value: `${contact.phone || "+91 84324 85204"} (${contact.whatsappHandle || "@ayyajahmad"})`,
      href: contact.whatsapp || "https://wa.me/918432485204",
      copyValue: contact.phoneRaw || "+918432485204",
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
      value: profile?.location || "Hinjawadi, Pune, Maharashtra, India",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile?.location || "Hinjawadi, Pune, Maharashtra, India")}`,
      copyValue: profile?.location || "Hinjawadi, Pune, Maharashtra, India",
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

      {/* Online Contact Message Form */}
      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "28px",
          marginBottom: "32px"
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <span className="section-micro-label">INBOX SUBMISSION</span>
          <h2 style={{ fontSize: "20px", color: "var(--text-bright)", margin: "4px 0 6px" }}>
            Send an Online Message
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0, maxWidth: "60ch" }}>
            Have an open role, engineering project inquiry, or collaboration idea? Leave a message below and it will be routed directly to my platform inbox.
          </p>
        </div>

        {submitStatus === "success" && (
          <div
            style={{
              padding: "14px 18px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid var(--accent-emerald)",
              borderRadius: "var(--radius-sm)",
              color: "var(--accent-emerald)",
              fontSize: "13.5px",
              marginBottom: "20px"
            }}
          >
            ✓ {statusMessage}
          </div>
        )}

        {submitStatus === "error" && (
          <div
            style={{
              padding: "14px 18px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-sm)",
              color: "#fca5a5",
              fontSize: "13px",
              marginBottom: "20px"
            }}
          >
            ⚠️ {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmitMessage} style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            <div>
              <label htmlFor="contact-name" className="admin-label">YOUR NAME</label>
              <input
                id="contact-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="admin-input"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="admin-label">YOUR EMAIL ADDRESS</label>
              <input
                id="contact-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="admin-input"
                placeholder="e.g. rahul@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-subject" className="admin-label">SUBJECT</label>
            <input
              id="contact-subject"
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="admin-input"
              placeholder="e.g. Full Stack Developer Opportunity / Project Discussion"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="admin-label">MESSAGE</label>
            <textarea
              id="contact-message"
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="admin-textarea"
              placeholder="Provide a brief summary of the role, team, or project requirements..."
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              disabled={submitStatus === "submitting"}
            >
              {submitStatus === "submitting" ? "Transmitting..." : "Send Message →"}
            </Button>
          </div>
        </form>
      </section>

      {/* Direct Fallback Protocol */}
      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--accent-emerald)", fontWeight: "bold" }}>●</span>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-cyan)", letterSpacing: "0.03em" }}>
            FAST RESPONSE PROTOCOL
          </span>
        </div>

        <h2 style={{ fontSize: "17px", color: "var(--text-bright)", margin: 0 }}>
          Direct, zero-friction communication
        </h2>

        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", lineHeight: "1.65", margin: 0, maxWidth: "68ch" }}>
          To ensure reliable delivery without third-party email service dropouts, communications are also handled directly through verified channels. You can click to launch an email directly to <strong>{contact.email}</strong> or initiate a conversation via WhatsApp or LinkedIn.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
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
