import React, { useState, useEffect } from "react";
import { getCertifications, saveCertification, deleteCertification } from "../../services/dataService";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminCertificationsPage() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");

  const loadData = async () => {
    const data = await getCertifications();
    setList(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item) => {
    setEditing({
      ...item,
      skillsStr: item.skills ? item.skills.join(", ") : ""
    });
  };

  const handleCreate = () => {
    setEditing({
      name: "",
      issuer: "",
      date: "2026",
      status: "Completed",
      credentialId: "",
      verificationUrl: "",
      description: "",
      skillsStr: "Java, Spring Boot"
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;

    const payload = {
      ...editing,
      skills: editing.skillsStr.split(",").map((s) => s.trim()).filter(Boolean)
    };
    delete payload.skillsStr;

    await saveCertification(payload);
    await loadData();
    setEditing(null);
    setNotice("Certification credential saved.");
    setTimeout(() => setNotice(""), 3000);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete certificate "${name}"?`)) {
      await deleteCertification(id);
      await loadData();
      setNotice("Credential deleted.");
      setTimeout(() => setNotice(""), 3000);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Manage Certifications — Admin CMS" description="Manage verified certifications and training licenses." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">CREDENTIALS REGISTRY</span>
          <h1 className="admin-page-title">Certifications &amp; Licenses</h1>
          <p className="admin-page-desc">
            Manage verified industry training certifications, issuers, and verification credentials.
          </p>
        </div>

        <Button onClick={handleCreate} variant="primary" size="sm">
          + Add Certification
        </Button>
      </div>

      {notice && (
        <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid var(--accent-emerald)", borderRadius: "var(--radius-sm)", color: "var(--accent-emerald)", fontSize: "13px", marginBottom: "20px" }}>
          {notice}
        </div>
      )}

      {editing && (
        <div className="card" style={{ marginBottom: "32px", border: "2px solid var(--accent-cyan)" }}>
          <div className="section-row-header">
            <h2 className="section-title-sm">Edit Certification: {editing.name || "New Credential"}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">CERTIFICATION / COURSE TITLE</label>
                <input
                  type="text"
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. MERN Stack + AI Practical Development Training"
                />
              </div>

              <div>
                <label className="admin-label">ISSUING ORGANIZATION</label>
                <input
                  type="text"
                  required
                  value={editing.issuer}
                  onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. BQARLSON Software Pvt. Ltd."
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label className="admin-label">ISSUE DATE / YEAR</label>
                <input
                  type="text"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="admin-input"
                  placeholder="2026"
                />
              </div>

              <div>
                <label className="admin-label">CREDENTIAL ID (OPTIONAL)</label>
                <input
                  type="text"
                  value={editing.credentialId || ""}
                  onChange={(e) => setEditing({ ...editing, credentialId: e.target.value })}
                  className="admin-input"
                  placeholder="Leave empty if not applicable"
                />
              </div>

              <div>
                <label className="admin-label">VERIFICATION LINK (OPTIONAL)</label>
                <input
                  type="url"
                  value={editing.verificationUrl || ""}
                  onChange={(e) => setEditing({ ...editing, verificationUrl: e.target.value })}
                  className="admin-input"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="admin-label">DESCRIPTION</label>
              <textarea
                rows={2}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div>
              <label className="admin-label">SKILLS COVERED (COMMA-SEPARATED)</label>
              <input
                type="text"
                value={editing.skillsStr}
                onChange={(e) => setEditing({ ...editing, skillsStr: e.target.value })}
                className="admin-input"
                placeholder="React.js, Node.js, MongoDB, REST Architecture"
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Button type="submit" variant="primary">
                Save Certification
              </Button>
              <Button onClick={() => setEditing(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {list.map((item) => (
          <div key={item.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ fontSize: "16px", color: "var(--text-bright)", margin: 0 }}>{item.name}</h3>
                <div style={{ color: "var(--accent-amber)", fontSize: "13px", marginTop: "2px" }}>
                  {item.issuer} · {item.date}
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px", maxWidth: "68ch" }}>
                  {item.description}
                </p>
                {item.skills && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                    {item.skills.map((s) => (
                      <span key={s} className="micro-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                  Edit ✎
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.name)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "#f87171" }}
                >
                  Delete ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

