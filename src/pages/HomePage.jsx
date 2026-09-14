import React from "react";
import { usePortfolioMode } from "../context/ModeContext";
import NormalHomeView from "../components/NormalHomeView";
import RecruiterHomeView from "../components/RecruiterHomeView";

export default function HomePage() {
  const { isRecruiter } = usePortfolioMode();

  return isRecruiter ? <RecruiterHomeView /> : <NormalHomeView />;
}
