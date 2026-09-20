import React from "react";
import Button from "./Button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-state" style={{ margin: "48px auto", maxWidth: "600px", padding: "36px", textAlign: "center" }}>
          <span className="page-badge" style={{ color: "var(--accent-amber)", borderColor: "rgba(245, 158, 11, 0.4)" }}>
            PLATFORM NOTICE
          </span>
          <h2 style={{ fontSize: "20px", color: "var(--text-bright)", margin: "14px 0 8px" }}>
            Something went wrong while loading the portfolio.
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "24px", lineHeight: "1.6" }}>
            A temporary component rendering error occurred. You can reload the application or return to the main view.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Button onClick={() => window.location.reload()} variant="primary">
              Reload Page
            </Button>
            <Button onClick={() => window.location.assign("/")} variant="outline">
              Return Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

