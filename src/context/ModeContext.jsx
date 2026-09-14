import React, { createContext, useContext, useState, useEffect } from "react";

const ModeContext = createContext();

export function ModeProvider({ children }) {
  const [portfolioMode, setPortfolioMode] = useState(() => {
    try {
      const saved = localStorage.getItem("portfolioMode");
      return saved === "recruiter" ? "recruiter" : "normal";
    } catch {
      return "normal";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("portfolioMode", portfolioMode);
    } catch {
      // Ignore storage write error
    }
  }, [portfolioMode]);

  const toggleMode = () => {
    setPortfolioMode((prev) => (prev === "normal" ? "recruiter" : "normal"));
  };

  const setMode = (mode) => {
    if (mode === "normal" || mode === "recruiter") {
      setPortfolioMode(mode);
    }
  };

  return (
    <ModeContext.Provider value={{ portfolioMode, isRecruiter: portfolioMode === "recruiter", toggleMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function usePortfolioMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("usePortfolioMode must be used within a ModeProvider");
  }
  return context;
}

