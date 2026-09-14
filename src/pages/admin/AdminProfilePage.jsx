import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  if (!profile) return <div className="admin-page">Loading profile...</div>;

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile(profile);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="admin-page">
      <SEO title="Edit Profile — Admin CMS" description="Manage developer profile identity." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">PROFILE MANAGEMENT</span>
          <h1 className="admin-page-title">Personal Identity &amp; Positioning</h1>
          <p className="admin-page-desc">
            Update personal biographical details, positioning statement, and contact channels.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid var(--accent-emerald)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-emerald)",
            fontSize: "13px",
            marginBottom: "20px"
          }}
        >
          ✓ Profile changes saved and published immediately to the public site.
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ display: "grid", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div>
            <label className="admin-label">FULL NAME</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="admin-label">PROFESSIONAL TITLE</label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="admin-input"
              required
            />
          </div>
        </div>

        <div>
          <label className="admin-label">HEADLINE / SUPPORTING STACK</label>
          <input
            type="text"
            value={profile.headline}
            onChange={(e) => handleChange("headline", e.target.value)}
            className="admin-input"
            required
          />
        </div>

        <div>
          <label className="admin-label">CURRENT ROLE &amp; COMPANY</label>
          <input
            type="text"
            value={profile.currentRole}
            onChange={(e) => handleChange("currentRole", e.target.value)}
            className="admin-input"
            required
          />
        </div>

        <div>
          <label className="admin-label">SHORT POSITIONING STATEMENT (BIO)</label>
          <textarea
            rows={3}
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="admin-textarea"
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div>
            <label className="admin-label">PUBLIC LOCATION (CITY, STATE, COUNTRY)</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="admin-input"
              required
            />
            <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", marginTop: "4px" }}>
              Note: Exact street address is strictly kept private per privacy regulations.
            </span>
          </div>

          <div>
            <label className="admin-label">AVAILABILITY STATUS</label>
            <input
              type="text"
              value={profile.availability}
              onChange={(e) => handleChange("availability", e.target.value)}
              className="admin-input"
              required
            />
          </div>
        </div>

        <h3 style={{ fontSize: "16px", color: "var(--text-bright)", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
          Contact Channels &amp; Social Links
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div>
            <label className="admin-label">EMAIL ADDRESS</label>
            <input
              type="email"
              value={profile.contact.email}
              onChange={(e) => handleContactChange("email", e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="admin-label">PHONE NUMBER (PUBLIC)</label>
            <input
              type="text"
              value={profile.contact.phone}
              onChange={(e) => handleContactChange("phone", e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="admin-label">LINKEDIN URL</label>
            <input
              type="url"
              value={profile.contact.linkedin}
              onChange={(e) => handleContactChange("linkedin", e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="admin-label">GITHUB PROFILE URL</label>
            <input
              type="url"
              value={profile.contact.github}
              onChange={(e) => handleContactChange("github", e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="admin-label">WHATSAPP LINK</label>
            <input
              type="url"
              value={profile.contact.whatsapp}
              onChange={(e) => handleContactChange("whatsapp", e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="admin-label">GOOGLE DRIVE RESUME LINK</label>
            <input
              type="url"
              value={profile.contact.resumeDrive}
              onChange={(e) => handleContactChange("resumeDrive", e.target.value)}
              className="admin-input"
              required
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <Button type="submit" variant="primary" size="lg">
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

