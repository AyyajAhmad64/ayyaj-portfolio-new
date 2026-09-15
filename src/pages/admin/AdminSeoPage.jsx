import React, { useState, useEffect } from "react";
import { getSettings, updateSettings, getProfile, updateProfile } from "../../services/dataService";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminSeoPage() {
  const { refresh } = usePortfolioData();
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [siteTitle, setSiteTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("/profile.jpg");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [s, p] = await Promise.all([getSettings(), getProfile()]);
      setSettings(s || {});
      setProfile(p || {});
      setSiteTitle(s?.siteTitle || "Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing");
      setMetaDesc(p?.bio || "Software Developer specializing in Java, Spring Boot, React.js, and Cloud Computing (MCA).");
      setKeywords("Software Developer, Full Stack Engineer, Java, Spring Boot, React.js, Cloud Computing, MCA, Pune");
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await Promise.all([
        updateSettings({ siteTitle }),
        updateProfile({ bio: metaDesc })
      ]);
      if (refresh) await refresh();
      setNotice("✓ SEO and metadata settings saved successfully.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to save SEO settings:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings || !profile) return <div className="admin-page">Loading SEO settings...</div>;

  return (
    <div className="admin-page">
      <SEO title="Search Engine Optimization — Admin CMS" description="Manage SEO metadata and OpenGraph settings." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">SYSTEM / DISCOVERABILITY</span>
          <h1 className="admin-page-title">Search Engine Optimization (SEO)</h1>
          <p className="admin-page-desc">
            Configure global search engine titles, OpenGraph social sharing cards, meta tags, and structured discoverability.
          </p>
        </div>

        <Button onClick={handleSave} variant="primary" size="sm" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save SEO Settings"}
        </Button>
      </div>

      {notice && (
        <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid var(--accent-emerald)", borderRadius: "var(--radius-sm)", color: "var(--accent-emerald)", fontSize: "13px", marginBottom: "20px" }}>
          {notice}
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ display: "grid", gap: "20px", maxWidth: "800px" }}>
        <div>
          <label className="admin-label">GLOBAL DEFAULT SITE TITLE</label>
          <input
            type="text"
            required
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="admin-input"
            placeholder="Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing"
          />
          <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", marginTop: "4px" }}>
            Displayed in browser tab titles and Google search snippet headlines.
          </span>
        </div>

        <div>
          <label className="admin-label">GLOBAL META DESCRIPTION</label>
          <textarea
            rows={3}
            required
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
            className="admin-textarea"
            placeholder="Comprehensive description for search engines and social preview cards..."
          />
          <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", marginTop: "4px" }}>
            Recommended length: 140–160 characters. Current length: {metaDesc.length} characters.
          </span>
        </div>

        <div>
          <label className="admin-label">META KEYWORDS (COMMA-SEPARATED)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="admin-input"
          />
        </div>

        <div>
          <label className="admin-label">OPENGRAPH SOCIAL SHARE IMAGE (PATH OR URL)</label>
          <input
            type="text"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            className="admin-input"
          />
          <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block", marginTop: "4px" }}>
            Preview image attached when links to your portfolio are shared on LinkedIn, Twitter, or WhatsApp.
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <Button type="submit" variant="primary" size="lg" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save SEO Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
