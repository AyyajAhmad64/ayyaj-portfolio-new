import React, { useState, useEffect } from "react";
import { fetchMessagesInbox, updateMessageStatus, deleteMessage } from "../../services/supabaseService";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  const loadMessages = async () => {
    setLoading(true);
    const data = await fetchMessagesInbox();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setErrorNotice("");
    setNotice("");
    try {
      await updateMessageStatus(id, newStatus);
      await loadMessages();
      setNotice(`Message status marked as "${newStatus}".`);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to update message status:", err);
      setErrorNotice(err.message || "Cloud update failed. Message status not changed.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setErrorNotice("");
      setNotice("");
      try {
        await deleteMessage(id);
        await loadMessages();
        setNotice("Message deleted.");
        setTimeout(() => setNotice(""), 3000);
      } catch (err) {
        console.error("Failed to delete message:", err);
        setErrorNotice(err.message || "Cloud delete failed. Message was not deleted.");
      }
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="admin-page">
      <SEO title="Messages Inbox — Admin CMS" description="Manage inbound contact messages." />

      <div className="admin-page-header">
        <div>
          <span className="section-micro-label">COMMUNICATION</span>
          <h1 className="admin-page-title">Contact Messages Inbox</h1>
          <p className="admin-page-desc">
            Inbound inquiries and recruiter contact submissions received via the public Contact page.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.3)"
              }}
            >
              {unreadCount} Unread
            </span>
          )}
          <Button onClick={loadMessages} variant="outline" size="sm">
            Refresh ↻
          </Button>
        </div>
      </div>

      {notice && (
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
          {notice}
        </div>
      )}

      {errorNotice && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid var(--accent-rose)",
            borderRadius: "var(--radius-sm)",
            color: "var(--accent-rose)",
            fontSize: "13px",
            marginBottom: "20px"
          }}
        >
          {errorNotice}
        </div>
      )}

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
          ⚠️ Supabase credentials are not yet configured in <code>.env</code>. Messages will be stored in Supabase PostgreSQL once configured.
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["all", "unread", "read", "replied", "archived"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`}
          >
            {f.toUpperCase()} ({f === "all" ? messages.length : messages.filter((m) => m.status === f).length})
          </button>
        ))}
      </div>

      {/* Messages List */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Loading inbound messages...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📬</div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
            No messages found for filter &quot;{filter}&quot;.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filtered.map((msg) => {
            const isUnread = msg.status === "unread";
            return (
              <div
                key={msg.id}
                className="card"
                style={{
                  borderLeft: isUnread ? "4px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                  background: isUnread ? "var(--bg-elevated)" : "var(--bg-surface)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "15px", color: "var(--text-bright)", margin: 0 }}>
                        {msg.name}
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                        &lt;{msg.email}&gt;
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent-amber)" }}>
                      Subject: {msg.subject || "No Subject"}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background:
                          msg.status === "unread"
                            ? "rgba(239, 68, 68, 0.15)"
                            : msg.status === "read"
                            ? "rgba(56, 189, 248, 0.15)"
                            : "rgba(16, 185, 129, 0.15)",
                        color:
                          msg.status === "unread"
                            ? "#f87171"
                            : msg.status === "read"
                            ? "var(--accent-cyan)"
                            : "var(--accent-emerald)"
                      }}
                    >
                      {msg.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "14px",
                    background: "var(--bg-base)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "13.5px",
                    color: "var(--text-main)",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                    marginBottom: "14px"
                  }}
                >
                  {msg.message}
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent("Re: " + (msg.subject || "Portfolio Inquiry"))}`}
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStatusChange(msg.id, "replied")}
                  >
                    Reply via Email ✉️
                  </a>

                  {msg.status === "unread" ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(msg.id, "read")}
                      className="btn btn-outline btn-sm"
                    >
                      Mark as Read ✓
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(msg.id, "unread")}
                      className="btn btn-ghost btn-sm"
                    >
                      Mark as Unread
                    </button>
                  )}

                  {msg.status !== "archived" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(msg.id, "archived")}
                      className="btn btn-ghost btn-sm"
                    >
                      Archive 📁
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "#f87171", marginLeft: "auto" }}
                  >
                    Delete ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

