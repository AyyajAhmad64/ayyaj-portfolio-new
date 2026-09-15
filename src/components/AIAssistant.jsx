import React, { useState, useRef, useEffect } from "react";
import { queryJARVIS, quickQuestions } from "../services/aiKnowledgeService";
import { usePortfolioData } from "../context/PortfolioDataContext";

export default function AIAssistant() {
  const portfolioData = usePortfolioData();

  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "initial-greeting",
      role: "assistant",
      text: "Hi! I'm **JARVIS**, Ayyaj's portfolio assistant. Ask me about his skills, projects, education, experience, or how to contact him.\n\nSelect a prompt below or type your question!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll conversation to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input on desktop
      if (window.innerWidth > 640) {
        inputRef.current?.focus();
      }
    }
  }, [isOpen, messages]);

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || inputVal).trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputVal("");
    setIsLoading(true);

    try {
      const responseText = await queryJARVIS(textToSend, messages, portfolioData);
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: responseText
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("JARVIS error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: "I encountered an issue retrieving that information. Please try another question or reach out to Ayyaj directly via the Contact page."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleClear = () => {
    setMessages([
      {
        id: `greeting-${Date.now()}`,
        role: "assistant",
        text: "Conversation refreshed. I'm **JARVIS**, ready to answer questions about Ayyaj's portfolio, stack, or background."
      }
    ]);
  };

  // Helper to render simple markdown formatting (**bold**, links, bullets)
  const renderFormattedText = (text) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Parse markdown bold: **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const renderedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx} style={{ color: "var(--text-bright)" }}>{part.slice(2, -2)}</strong>;
        }
        // Parse markdown link: [label](url)
        const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const before = part.slice(0, linkMatch.index);
          const after = part.slice(linkMatch.index + linkMatch[0].length);
          return (
            <React.Fragment key={pIdx}>
              {before}
              <a
                href={linkMatch[2]}
                target={linkMatch[2].startsWith("http") || linkMatch[2].endsWith(".pdf") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}
              >
                {linkMatch[1]}
              </a>
              {after}
            </React.Fragment>
          );
        }
        return part;
      });

      return (
        <div key={idx} style={{ minHeight: line.trim() === "" ? "8px" : "auto", marginBottom: "3px" }}>
          {renderedLine}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-assistant-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open Ask JARVIS Assistant"
          title="Ask JARVIS — Ayyaj's Portfolio Assistant"
        >
          <span className="ai-launcher-dot" aria-hidden="true" />
          <span className="ai-launcher-icon">🤖</span>
          <span className="ai-launcher-text">Ask JARVIS</span>
        </button>
      )}

      {/* Floating Assistant Modal / Window */}
      {isOpen && (
        <div className="ai-assistant-window" role="dialog" aria-modal="false" aria-label="Ask JARVIS">
          {/* Header */}
          <div className="ai-assistant-header">
            <div className="ai-header-info">
              <div className="ai-header-title-row">
                <span className="ai-status-indicator" aria-hidden="true" />
                <span className="ai-header-title">JARVIS</span>
                <span className="ai-header-badge">● Online &amp; Ready</span>
              </div>
              <span className="ai-header-subtitle">Ayyaj&apos;s Portfolio Assistant</span>
            </div>

            <div className="ai-header-actions">
              <button
                type="button"
                className="ai-action-btn"
                onClick={handleClear}
                title="Reset conversation with JARVIS"
                aria-label="Reset conversation"
              >
                ↺
              </button>
              <button
                type="button"
                className="ai-action-btn"
                onClick={() => setIsOpen(false)}
                title="Close JARVIS"
                aria-label="Close JARVIS"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="ai-quick-chips" aria-label="Quick Question Suggestions">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                className="ai-chip"
                onClick={() => handleSend(q)}
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="ai-messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-message-row ${msg.role === "user" ? "is-user" : "is-assistant"}`}
              >
                {msg.role === "assistant" && (
                  <div className="ai-msg-avatar" aria-hidden="true" title="JARVIS">
                    ⚡
                  </div>
                )}
                <div className={`ai-message-bubble ${msg.role === "user" ? "user-bubble" : "assistant-bubble"}`}>
                  {renderFormattedText(msg.text)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-message-row is-assistant">
                <div className="ai-msg-avatar" aria-hidden="true" title="JARVIS">
                  ⚡
                </div>
                <div className="ai-message-bubble assistant-bubble" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  JARVIS is retrieving portfolio details...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Form */}
          <form className="ai-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="ai-input"
              placeholder="Ask JARVIS about Ayyaj's stack, projects, address..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
              aria-label="Question for JARVIS"
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={!inputVal.trim() || isLoading}
              aria-label="Send question to JARVIS"
            >
              Send ↵
            </button>
          </form>
        </div>
      )}
    </>
  );
}
