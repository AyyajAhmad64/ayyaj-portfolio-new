import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import SEO from "../../components/SEO";

export default function AdminAnalyticsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventCounts, setEventCounts] = useState({});

  useEffect(() => {
    async function loadAnalytics() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("analytics_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (!error && data) {
          setEvents(data);

          // Count by event name
          const counts = {};
          data.forEach((ev) => {
            counts[ev.event_name] = (counts[ev.event_name] || 0) + 1;
          });
          setEventCounts(counts);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const totalEvents = events.length;

  return (
    <div className="admin-page">
      <SEO title="Platform Analytics — Admin CMS" description="View portfolio engagement telemetry." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">INSIGHTS / TELEMETRY</span>
          <h1 className="admin-page-title">Platform Engagement &amp; Analytics</h1>
          <p className="admin-page-desc">
            Privacy-respecting engagement telemetry recorded in Supabase. Tracks recruiter visits, resume downloads, project case study reviews, and contact interactions.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>TOTAL RECORDED EVENTS</span>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {totalEvents}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Recent telemetry log</span>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-emerald)", fontWeight: "700" }}>PAGE VIEWS</span>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {eventCounts["page_view"] || 0}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Visitor sessions</span>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: "700" }}>PROJECT VIEWS</span>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {eventCounts["project_view"] || 0}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Deep-dive case studies</span>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>RESUME DOWNLOADS</span>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {(eventCounts["resume_download"] || 0) + (eventCounts["resume_view"] || 0)}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>CV downloads &amp; views</span>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--accent-amber)", fontWeight: "700" }}>RECRUITER MODE VISITS</span>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-bright)", marginTop: "4px" }}>
            {eventCounts["recruiter_mode_visit"] || 0}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Hiring manager portal</span>
        </div>
      </div>

      {/* Recent Telemetry Stream */}
      <div className="card" style={{ display: "grid", gap: "16px" }}>
        <h2 className="section-title-sm">Recent Engagement Stream</h2>

        {loading ? (
          <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading telemetry from Supabase...</div>
        ) : events.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "13px", padding: "20px 0" }}>
            No analytics events logged yet. Visitor page views and project clicks will appear here automatically.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                  <th style={{ padding: "10px 8px" }}>EVENT</th>
                  <th style={{ padding: "10px 8px" }}>PATH</th>
                  <th style={{ padding: "10px 8px" }}>METADATA</th>
                  <th style={{ padding: "10px 8px" }}>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 8px", fontWeight: "600", color: "var(--accent-cyan)" }}>
                      {ev.event_name}
                    </td>
                    <td style={{ padding: "10px 8px", color: "var(--text-bright)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {ev.page_path || "/"}
                    </td>
                    <td style={{ padding: "10px 8px", color: "var(--text-muted)", fontSize: "12px" }}>
                      {ev.metadata ? JSON.stringify(ev.metadata) : "—"}
                    </td>
                    <td style={{ padding: "10px 8px", color: "var(--text-dim)", fontSize: "12px" }}>
                      {new Date(ev.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
