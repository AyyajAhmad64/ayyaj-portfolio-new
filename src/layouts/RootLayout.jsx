import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import AIAssistant from "../components/AIAssistant";
import { scrollToTarget } from "../utils/scrollUtils";
import { usePortfolioMode } from "../context/ModeContext";

export default function RootLayout() {
  const location = useLocation();
  const { isRecruiter } = usePortfolioMode();

  // Scroll to hash target smoothly or scroll to top on route change
  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const scrolled = scrollToTarget(location.hash, false);
        if (!scrolled) {
          setTimeout(() => scrollToTarget(location.hash, false), 150);
        }
      }, 60);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className={`app-layout ${isRecruiter ? "recruiter-mode-active" : ""}`}>
      <Navbar />
      <main className="main-content" id="mainContent">
        <Outlet />
      </main>
      <BackToTop />
      <AIAssistant />
      <Footer />
    </div>
  );
}
