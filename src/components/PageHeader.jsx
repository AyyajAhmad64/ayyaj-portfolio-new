import React from "react";

export default function PageHeader({ badge, title, subtitle }) {
  return (
    <header className="page-header">
      {badge && <span className="page-badge">{badge}</span>}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
}

