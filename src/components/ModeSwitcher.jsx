import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePortfolioMode } from "../context/ModeContext";

export default function ModeSwitcher({ className = "" }) {
  const { isRecruiter, setMode } = usePortfolioMode();
  const navigate = useNavigate();
  const location = useLocation();

  const handleModeChange = (targetMode) => {
    setMode(targetMode);
    if (targetMode === "recruiter") {
      navigate("/recruiter/overview");
    } else {
      if (location.pathname.startsWith("/recruiter")) {
        navigate("/");
      }
    }
  };

  return (
    <div className={`mode-switcher ${className}`.trim()} role="group" aria-label="Portfolio viewing mode">
      <button
        type="button"
        className={`mode-btn ${!isRecruiter ? "active" : ""}`}
        onClick={() => handleModeChange("normal")}
        aria-pressed={!isRecruiter}
        title="Full personal portfolio view"
      >
        Portfolio
      </button>
      <button
        type="button"
        className={`mode-btn ${isRecruiter ? "active" : ""}`}
        onClick={() => handleModeChange("recruiter")}
        aria-pressed={isRecruiter}
        title="Dedicated candidate briefing for recruiters and hiring managers"
      >
        <span className="mode-dot" aria-hidden="true" />
        Recruiter
      </button>
    </div>
  );
}
