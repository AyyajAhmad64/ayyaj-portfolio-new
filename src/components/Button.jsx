import React from "react";
import { Link, useLocation } from "react-router-dom";
import { scrollToTarget } from "../utils/scrollUtils";

export default function Button({
  children,
  to,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  download,
  target,
  rel,
  type = "button",
  ...props
}) {
  const location = useLocation();
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== "md" ? `btn-${size}` : "";
  const combinedClass = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  const handleLinkClick = (e) => {
    if (to && (to.startsWith("#") || (to.startsWith("/#") && location.pathname === "/"))) {
      const targetId = to.replace(/^\/?#/, "");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        scrollToTarget(targetId, true);
      }
    }
    if (onClick) onClick(e);
  };

  if (to) {
    return (
      <Link to={to} className={combinedClass} onClick={handleLinkClick} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={combinedClass}
        onClick={onClick}
        download={download}
        target={target}
        rel={target === "_blank" ? rel || "noopener noreferrer" : rel}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={combinedClass} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

