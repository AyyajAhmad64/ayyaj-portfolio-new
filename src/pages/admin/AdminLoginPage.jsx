import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminLoginPage() {
  const { login, isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/admin";
  const isConfigured = isSupabaseConfigured();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  if (loading) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-box card" style={{ textAlign: "center", padding: "48px 32px" }}>
          <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.error || "Authentication failed. Please verify your credentials.");
    }
  };

  return (
    <div className="admin-login-wrapper">
      <SEO title="Admin Login" description="Ayyaj Kalandar Shaikh — Portfolio Platform CMS Login" />

      <div className="admin-login-box card">
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span className="page-badge" style={{ color: "var(--accent-cyan)" }}>
            PLATFORM MANAGEMENT
          </span>
          <h1 style={{ fontSize: "22px", color: "var(--text-bright)", margin: "8px 0 4px" }}>
            Admin Control Center
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Enter your Supabase Auth credentials to access the CMS.
          </p>
        </div>

        {/* Supabase not configured warning */}
        {!isConfigured && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "var(--radius-sm)",
              color: "#fcd34d",
              fontSize: "12px",
              marginBottom: "16px",
              lineHeight: "1.6"
            }}
          >
            ⚠️ <strong>Supabase not configured.</strong> Add{" "}
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your{" "}
            <code>.env</code> file to enable cloud authentication.
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "var(--radius-sm)",
              color: "#fca5a5",
              fontSize: "12.5px",
              marginBottom: "16px"
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--accent-amber)", marginBottom: "6px" }}
            >
              ADMIN EMAIL
            </label>
            <input
              id="email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ayyajahmad64@gmail.com"
              className="admin-input"
              autoComplete="email"
              disabled={!isConfigured}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--accent-amber)", marginBottom: "6px" }}
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="admin-input"
              autoComplete="current-password"
              disabled={!isConfigured}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            style={{ width: "100%", marginTop: "8px" }}
            disabled={submitting || !isConfigured}
          >
            {submitting ? "Authenticating..." : "Authorize Access →"}
          </Button>
        </form>

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
          <Link to="/" style={{ fontSize: "12.5px", color: "var(--accent-cyan)" }}>
            ← Return to Public Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
