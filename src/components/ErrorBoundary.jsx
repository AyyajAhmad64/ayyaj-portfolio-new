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
        <div className="empty-state" style={{ margin: "48px auto", maxWidth: "600px", padding: "36px" }}>
          <span className="page-badge" style={{ color: "var(--accent-amber)", borderColor: "rgba(245, 158, 11, 0.4)" }}>
            RUNTIME NOTICE
          </span>
          <h2 style={{ fontSize: "20px", color: "var(--text-bright)", margin: "10px 0" }}>
            Application Encountered an Exception
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px", marginBottom: "20px" }}>
            A temporary component rendering error occurred. You can safely return home or reload the view.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <Button onClick={() => window.location.assign("/")} variant="primary">
              Reload Home View
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

