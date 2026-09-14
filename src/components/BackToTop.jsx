import React, { useState, useEffect } from "react";
import { scrollToTop } from "../utils/scrollUtils";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Back to top"
    >
      ↑
    </button>
  );
}

