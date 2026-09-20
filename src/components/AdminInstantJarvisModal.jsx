import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import { resolveJarvisQuery } from "../services/jarvisIntelligenceService";
import { fetchAuditLogs, fetchMessagesInbox } from "../services/supabaseService";
import { getMedia } from "../services/dataService";
import { isSupabaseConfigured } from "../lib/supabaseClient";

const QUICK_PROMPTS = [
  "Give me a portfolio overview",
  "Which projects are incomplete?",
  "Is my portfolio healthy?",
  "How is my SEO?",
  "Show my drafts",
  "What changed recently?"
];

export default function AdminInstantJarvisModal({ isOpen, onClose, initialQuery = "" }) {
  const portfolioData = usePortfolioData();
  const [query, setQuery] = useState(initialQuery || "");
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState({
    auditLogs: [],
    messages: [],
    media: []
  });
  const inputRef = useRef(null);

  // Load admin context once
  useEffect(() => {
    let isMounted = true;
    async function loadAux() {
      try {
        const [logs, msgs, mediaList] = await Promise.all([
          fetchAuditLogs().catch(() => []),
          fetchMessagesInbox().catch(() => []),
          getMedia().catch(() => [])
        ]);
        if (isMounted) {
          setAdminData({
            auditLogs: logs || [],
            messages: msgs || [],
            media: mediaList || []
          });
        }
      } catch {
        // Non-blocking
      }
    }
    if (isOpen) {
      loadAux();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle initial query if provided when opening
  useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery.trim()) {
        setQuery(initialQuery);
        executePrompt(initialQuery);
      } else {
        setQuery("");
        setActiveAnswer(null);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialQuery]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const executePrompt = (qStr) => {
    const promptToRun = (qStr || "").trim();
    if (!promptToRun) return;
    setIsLoading(true);
    try {
      const res = resolveJarvisQuery(promptToRun, portfolioData, adminData);
      setActiveAnswer(res);
    } catch (err) {
      console.error("Instant JARVIS execution error:", err);
      setActiveAnswer({
        heading: "ERROR RESOLVING QUERY",
        summary: "An error occurred while evaluating your query against portfolio data.",
        bullets: ["Please verify network connectivity and reload."],
        sourceLabel: "ASK JARVIS Intelligence",
        source: "Evaluation error",
        actions: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executePrompt(query);
  };

  if (!isOpen) return null;

  return (
    <div
      className="admin-jarvis-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="instant-jarvis-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
        boxSizing: "border-box"
      }}
    >
      <div
        className="admin-jarvis-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "88vh",
          backgroundColor: "var(--bg-surface)",
          border: "1.5px solid var(--accent-cyan)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7), 0 0 24px rgba(56, 189, 248, 0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box"
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            background: "var(--bg-elevated)",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <span style={{ fontSize: "22px", lineHeight: 1 }}>🤖</span>
            <div>
              <div
                id="instant-jarvis-title"
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text-bright)",
                  fontFamily: "var(--font-mono)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap"
                }}
              >
                <span>ASK JARVIS</span>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(56, 189, 248, 0.15)",
                    color: "var(--accent-cyan)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    fontWeight: "700"
                  }}
                >
                  INSTANT INTELLIGENCE
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "var(--accent-emerald)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    fontWeight: "700"
                  }}
                >
                  READ-ONLY
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                Portfolio-grounded decision support &amp; content analysis
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border-medium)",
              borderRadius: "4px",
              color: "var(--text-dim)",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "16px",
              flexShrink: 0,
              transition: "all 0.15s ease"
            }}
            aria-label="Close Instant Ask JARVIS modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1
          }}
        >
          {/* Query Input */}
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", width: "100%" }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask JARVIS about projects, skills, site health, SEO, media, drafts..."
              className="admin-input"
              style={{
                height: "44px",
                fontSize: "13.5px",
                background: "var(--bg-base)",
                borderColor: "var(--accent-cyan)",
                boxShadow: "0 0 0 2px rgba(56, 189, 248, 0.12)",
                flex: 1
              }}
              aria-label="Question for Ask JARVIS"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!query.trim() || isLoading}
              style={{
                height: "44px",
                padding: "0 18px",
                fontWeight: "700",
                fontSize: "13px",
                whiteSpace: "nowrap",
                flexShrink: 0
              }}
            >
              {isLoading ? "Analyzing..." : "Ask →"}
            </button>
          </form>

          {/* Quick Prompts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "10.5px", fontWeight: "700", color: "var(--text-dim)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
              Suggested Queries:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setQuery(p);
                    executePrompt(p);
                  }}
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "14px",
                    padding: "4px 10px",
                    fontSize: "11.5px",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-cyan)";
                    e.currentTarget.style.color = "var(--accent-cyan)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Active Answer Card */}
          {activeAnswer && (
            <div
              style={{
                marginTop: "6px",
                background: "var(--bg-base)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-sm)",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)"
              }}
            >
              {/* Answer Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                  {activeAnswer.heading}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "var(--accent-emerald)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    whiteSpace: "nowrap"
                  }}
                >
                  ● {activeAnswer.source || "Grounded CMS Data"}
                </div>
              </div>

              {/* Summary */}
              <p style={{ fontSize: "13px", color: "var(--text-bright)", lineHeight: "1.6", margin: 0 }}>
                {activeAnswer.summary}
              </p>

              {/* Bullets */}
              {Array.isArray(activeAnswer.bullets) && activeAnswer.bullets.length > 0 && (
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "12.5px",
                    color: "var(--text-muted)",
                    lineHeight: "1.5"
                  }}
                >
                  {activeAnswer.bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              )}

              {/* Deep-link Actions */}
              {Array.isArray(activeAnswer.actions) && activeAnswer.actions.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--border-subtle)"
                  }}
                >
                  {activeAnswer.actions.map((act, aIdx) => (
                    <Link
                      key={aIdx}
                      to={act.link}
                      onClick={onClose}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: "11.5px", gap: "4px" }}
                    >
                      {act.label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "11.5px",
            color: "var(--text-dim)",
            flexShrink: 0
          }}
        >
          <span>Press <kbd style={{ padding: "2px 5px", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: "3px" }}>Esc</kbd> to close</span>
          <Link
            to="/admin/jarvis"
            onClick={onClose}
            style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            Open Full JARVIS Console ↗
          </Link>
        </div>
      </div>
    </div>
  );
}

