/**
 * Utility functions for dynamic theme management and CSS custom property application.
 */

export function isValidHexColor(hex) {
  if (!hex || typeof hex !== "string") return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

export function hexToRgba(hex, alpha = 0.12) {
  if (!hex || typeof hex !== "string") return `rgba(56, 189, 248, ${alpha})`;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) return `rgba(56, 189, 248, ${alpha})`;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(56, 189, 248, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyThemeColors(primary, secondary) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (isValidHexColor(primary)) {
    const p = primary.trim();
    root.style.setProperty("--accent-cyan", p);
    root.style.setProperty("--accent-primary", p);
    root.style.setProperty("--border-active", p);
    root.style.setProperty("--accent-cyan-soft", hexToRgba(p, 0.12));
  }

  if (isValidHexColor(secondary)) {
    const s = secondary.trim();
    root.style.setProperty("--accent-amber", s);
    root.style.setProperty("--accent-secondary", s);
    root.style.setProperty("--accent-amber-soft", hexToRgba(s, 0.12));
  }
}
