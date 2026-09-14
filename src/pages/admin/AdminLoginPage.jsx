import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Button from "../../components/Button";
import SEO from "../../components/SEO";

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/admin";

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await login(username, password, remember);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.error || "Authentication failed. Please verify credentials.");
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
            Enter administrator authorization credentials to manage portfolio content.
          </p>
        </div>

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
              htmlFor="username"
              style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--accent-amber)", marginBottom: "6px" }}
            >
              ADMIN USERNAME
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ayyaj"
              className="admin-input"
              autoComplete="username"
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
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--text-muted)" }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label htmlFor="remember">Remember session on this workstation</label>
          </div>

          <Button type="submit" variant="primary" size="lg" style={{ width: "100%", marginTop: "8px" }}>
            {loading ? "Authenticating..." : "Authorize Access →"}
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

