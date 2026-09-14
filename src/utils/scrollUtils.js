/**
 * Global Smooth Scrolling Utility
 * Handles sticky navbar offsets, hash updates, and prefers-reduced-motion.
 */

// 68px navbar + 20px comfortable clearance
const NAV_OFFSET = 88;

export function isReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToTarget(targetElementOrId, updateHash = false) {
  if (typeof window === "undefined") return false;

  const targetId = typeof targetElementOrId === "string" ? targetElementOrId.replace(/^#/, "") : null;
  const element = targetId ? document.getElementById(targetId) : targetElementOrId;

  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const currentY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  const targetTop = rect.top + currentY - NAV_OFFSET;
  const behavior = isReducedMotion() ? "auto" : "smooth";

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior
  });

  if (updateHash && targetId && window.history?.pushState) {
    window.history.pushState(null, "", `#${targetId}`);
  }

  return true;
}

export function scrollToTop() {
  if (typeof window === "undefined") return;
  const behavior = isReducedMotion() ? "auto" : "smooth";
  window.scrollTo({ top: 0, left: 0, behavior });
}
