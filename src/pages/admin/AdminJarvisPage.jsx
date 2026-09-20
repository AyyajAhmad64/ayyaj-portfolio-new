import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { usePortfolioData } from "../../context/PortfolioDataContext";
import { resolveJarvisQuery, evaluateSiteHealth } from "../../services/jarvisIntelligenceService";
import { fetchAuditLogs, fetchMessagesInbox } from "../../services/supabaseService";
import { getMedia } from "../../services/dataService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import SEO from "../../components/SEO";

const SUGGESTED_QUESTIONS = [
  { label: "Portfolio Overview", query: "Give me a portfolio overview" },
  { label: "Incomplete Content", query: "Which projects are incomplete?" },
  { label: "Recent Changes", query: "What changed recently?" },
  { label: "Site Health", query: "Is my portfolio healthy?" },
  { label: "SEO Health", query: "How is my SEO?" },
  { label: "Unused Media", query: "Which media is unused?" },
  { label: "Draft Content", query: "Show my drafts" },
  { label: "Featured Showcase", query: "What is featured?" },
  { label: "Verified Certs", query: "Show my certifications" },
  { label: "Tech Stack", query: "What are my skills?" }
];

export default function AdminJarvisPage() {
  const portfolioData = usePortfolioData();
  const {
    projects = [],
    experience = [],
    education = [],
    skills = [],
    certifications = [],
    achievements = [],
    gallery = [],
    profile = {}
  } = portfolioData;

  const [adminData, setAdminData] = useState({
    auditLogs: [],
    messages: [],
    media: []
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch admin-level datasets (audit logs, messages, media library)
  useEffect(() => {
    let mounted = true;
    async function loadAdminContext() {
      try {
        const [logs, msgs, mediaList] = await Promise.all([
          fetchAuditLogs().catch(() => []),
          fetchMessagesInbox().catch(() => []),
          getMedia().catch(() => [])
        ]);
        if (mounted) {
          setAdminData({
            auditLogs: logs || [],
            messages: msgs || [],
            media: mediaList || []
          });
          setDataLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load admin context for JARVIS:", err);
        if (mounted) setDataLoaded(true);
      }
    }
    loadAdminContext();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-scroll conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleExecuteQuery = async (queryText) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    // Artificial brief settle for smooth natural feel
    await new Promise((r) => setTimeout(r, 120));

    try {
      const responseObj = resolveJarvisQuery(q, portfolioData, adminData);
      const assistantMsg = {
        id: `jarvis-${Date.now()}`,
        sender: "jarvis",
        data: responseObj,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("ASK JARVIS error:", err);
      const errorMsg = {
        id: `jarvis-err-${Date.now()}`,
        sender: "jarvis",
        data: {
          intent: "ERROR",
          heading: "QUERY PROCESSING ISSUE",
          summary: "I encountered an error retrieving that portfolio information.",
          bullets: ["Please verify your Supabase Cloud connection and try again."],
          text: "I couldn't process that query right now. Please try again.",
          sourceLabel: "System Handler",
          source: "Error Handler",
          actions: [],
          isReadOnly: true
        },
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const totalEntities =
    projects.length +
    certifications.length +
    experience.length +
    education.length +
    achievements.length +
    gallery.length;

  const siteHealth = evaluateSiteHealth({ ...portfolioData, media: adminData.media });

  return (
    <div className="admin-page" style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px", boxSizing: "border-box" }}>
      <SEO title="ASK JARVIS — Portfolio Intelligence | Admin" description="ASK JARVIS Portfolio Intelligence Assistant" />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1
              className="section-title"
              style={{
                margin: 0,
                fontSize: "clamp(20px, 4vw, 26px)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span style={{ fontSize: "24px" }}>🤖</span>
              <span>ASK JARVIS</span>
            </h1>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontSize: "11px",
                fontWeight: "600",
                padding: "3px 8px",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "normal",
                wordBreak: "break-word",
                maxWidth: "100%"
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", flexShrink: 0 }}></span>
              Live Portfolio Grounded ({totalEntities} Entities Indexed)
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "6px 0 0" }}>
            Professional Portfolio Intelligence &amp; Decision Support Assistant — Grounded strictly in your live Supabase CMS data.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="btn btn-outline btn-sm"
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            Clear Conversation
          </button>
        )}
      </div>

      {/* Metrics Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "10px",
          marginBottom: "20px"
        }}
      >
        <div className="card" style={{ padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-primary)" }}>{projects.length}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Projects</div>
        </div>
        <div className="card" style={{ padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#10b981" }}>{certifications.length}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Certifications</div>
        </div>
        <div className="card" style={{ padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#3b82f6" }}>{experience.length}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Experience</div>
        </div>
        <div className="card" style={{ padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#8b5cf6" }}>{skills.length}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Skill Categories</div>
        </div>
        <div className="card" style={{ padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "700", color: siteHealth.score >= 80 ? "#10b981" : "#f59e0b" }}>
            {siteHealth.score}%
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Site Health</div>
        </div>
      </div>

      {/* Suggested Questions Bar */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Suggested Inquiries
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {SUGGESTED_QUESTIONS.map((sq) => (
            <button
              key={sq.label}
              type="button"
              onClick={() => handleExecuteQuery(sq.query)}
              disabled={isLoading}
              className="btn btn-outline btn-sm"
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "16px",
                background: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {sq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div
        className="card"
        style={{
          minHeight: "420px",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          marginBottom: "16px",
          boxSizing: "border-box"
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "40px 20px"
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(59, 130, 246, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                marginBottom: "16px"
              }}
            >
              🤖
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "600" }}>
              Welcome to ASK JARVIS Intelligence 2.0
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "520px", fontSize: "13px", lineHeight: "1.5", margin: "0 0 20px" }}>
              I am connected to your live portfolio CMS. Ask me anything regarding project completeness,
              credentials, work history, media utilization, SEO health, or recent changes.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                width: "100%",
                maxWidth: "680px"
              }}
            >
              <div
                onClick={() => handleExecuteQuery("Give me a portfolio overview")}
                style={{
                  background: "var(--bg-base)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>📊 Portfolio Summary</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Overview of all indexed collections and health</div>
              </div>
              <div
                onClick={() => handleExecuteQuery("Which projects are incomplete?")}
                style={{
                  background: "var(--bg-base)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>🔍 Incomplete Projects</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Identify missing descriptions, demos, or media</div>
              </div>
              <div
                onClick={() => handleExecuteQuery("Which media is unused?")}
                style={{
                  background: "var(--bg-base)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>🖼️ Unused Media</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Find orphaned assets not linked in portfolio</div>
              </div>
              <div
                onClick={() => handleExecuteQuery("What needs attention?")}
                style={{
                  background: "var(--bg-base)",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>🩺 Site Health Audit</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Review warnings and optimization issues</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            {messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: "flex-end",
                      maxWidth: "80%",
                      background: "var(--color-primary)",
                      color: "#ffffff",
                      padding: "10px 16px",
                      borderRadius: "16px 16px 4px 16px",
                      fontSize: "13px",
                      lineHeight: "1.5"
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: "10px", opacity: 0.8, textAlign: "right", marginTop: "4px" }}>
                      {msg.timestamp}
                    </div>
                  </div>
                );
              }

              // Assistant Message
              const d = msg.data || {};
              const isSecurity = d.intent === "SECURITY_BOUNDARY";

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: "flex-start",
                    maxWidth: "92%",
                    width: "100%",
                    background: "var(--bg-base)",
                    border: isSecurity ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--border-subtle)",
                    borderRadius: "16px 16px 16px 4px",
                    padding: "16px 18px",
                    boxSizing: "border-box"
                  }}
                >
                  {/* Assistant Header & Attribution */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "10px",
                      paddingBottom: "8px",
                      borderBottom: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>{isSecurity ? "🛡️" : "🤖"}</span>
                      <span style={{ fontWeight: "700", fontSize: "13px", color: isSecurity ? "#ef4444" : "inherit" }}>
                        {d.heading || "ASK JARVIS"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {d.sourceLabel && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                            border: "1px solid rgba(59, 130, 246, 0.2)"
                          }}
                        >
                          {d.sourceLabel}
                        </span>
                      )}
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  {d.summary && (
                    <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "500", lineHeight: "1.5" }}>
                      {d.summary}
                    </p>
                  )}

                  {/* Bullets */}
                  {Array.isArray(d.bullets) && d.bullets.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        margin: "0 0 12px",
                        background: "var(--bg-surface)",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-subtle)"
                      }}
                    >
                      {d.bullets.map((b, i) => (
                        <div key={i} style={{ fontSize: "12px", lineHeight: "1.4" }}>
                          {b}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Deep link action buttons */}
                  {Array.isArray(d.actions) && d.actions.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                      {d.actions.map((act, i) => (
                        <Link
                          key={i}
                          to={act.link}
                          className="btn btn-outline btn-sm"
                          style={{
                            fontSize: "11px",
                            padding: "4px 10px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "var(--color-primary)",
                            borderColor: "var(--color-primary)"
                          }}
                        >
                          <span>{act.label}</span>
                          <span>→</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Source transparency footnote */}
                  {d.source && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        marginTop: "10px",
                        borderTop: "1px dashed var(--border-subtle)",
                        paddingTop: "6px"
                      }}
                    >
                      Source: {d.source}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "var(--bg-base)",
                  padding: "12px 18px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span>Analyzing live CMS knowledge graph...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecuteQuery();
        }}
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask JARVIS anything about projects, certifications, media, SEO, or site health..."
          className="admin-input"
          style={{
            flex: "1 1 200px",
            minWidth: 0,
            padding: "12px 16px",
            fontSize: "13px",
            borderRadius: "8px",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            color: "var(--text-base)"
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !inputQuery.trim()}
          style={{
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          {isLoading ? "Querying..." : "Ask JARVIS →"}
        </button>
      </form>
    </div>
  );
}
