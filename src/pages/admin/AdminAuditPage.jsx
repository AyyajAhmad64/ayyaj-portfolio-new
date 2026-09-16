import React, { useState, useEffect } from "react";
import { fetchAuditLogs } from "../../services/supabaseService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="admin-page">
      <SEO title="Audit Logs — Admin CMS" description="Security and operational audit trail." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">SYSTEM AUDIT TRAIL</span>
          <h1 className="admin-page-title">Operational Audit Logs</h1>
          <p className="admin-page-desc">
            Immutable log of all content mutations, administrative actions, updates, and deletions.
          </p>
        </div>

        <Button onClick={loadLogs} variant="outline" size="sm">
          Refresh ↻
        </Button>
      </div>

      {!isSupabaseConfigured() && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-amber)",
            fontSize: "13px",
            marginBottom: "24px"
          }}
        >
          ⚠️ Supabase is not configured yet. Audit logs are persisted to Supabase table <code>audit_logs</code> once credentials are provided in <code>.env</code>.
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Loading audit trail...
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
            No audit logs recorded yet. Changes will be logged automatically.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="card admin-audit-desktop-view" style={{ overflowX: "auto", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", color: "var(--text-bright)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>ACTION</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-bright)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>ENTITY</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-bright)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>DETAILS</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-bright)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>ACTOR</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-bright)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          background:
                            log.action === "DELETE"
                              ? "rgba(239, 68, 68, 0.15)"
                              : log.action === "UPSERT"
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(56, 189, 248, 0.15)",
                          color:
                            log.action === "DELETE"
                              ? "#f87171"
                              : log.action === "UPSERT"
                              ? "var(--accent-emerald)"
                              : "var(--accent-cyan)",
                          fontFamily: "var(--font-mono)"
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", color: "var(--accent-amber)" }}>
                      {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ""}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {log.actor_email || "admin"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "12px", whiteSpace: "nowrap" }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards View */}
          <div className="admin-audit-mobile-view">
            {logs.map((log) => (
              <div key={log.id} className="admin-audit-card">
                <div className="admin-audit-card-header">
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      background:
                        log.action === "DELETE"
                          ? "rgba(239, 68, 68, 0.15)"
                          : log.action === "UPSERT"
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(56, 189, 248, 0.15)",
                      color:
                        log.action === "DELETE"
                          ? "#f87171"
                          : log.action === "UPSERT"
                          ? "var(--accent-emerald)"
                          : "var(--accent-cyan)",
                      fontFamily: "var(--font-mono)"
                    }}
                  >
                    {log.action}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="admin-audit-card-entity">
                  <strong>ENTITY:</strong> {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ""}
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="admin-audit-card-details">
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="admin-audit-card-footer">
                  <span>ACTOR: {log.actor_email || "admin"}</span>
                  <span style={{ color: "var(--accent-cyan)" }}>AUDIT LOG RECORDED</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

