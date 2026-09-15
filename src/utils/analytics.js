/**
 * Privacy-Conscious Analytics Event Logger
 * Dispatches anonymous telemetry events to Supabase analytics_events table.
 * Does NOT collect PII, IP addresses, or tracking cookies.
 */

import { logAnalyticsEvent } from "../services/supabaseService";

export function trackEvent(eventName, metadata = {}) {
  if (typeof window === "undefined") return;
  try {
    const pagePath = window.location.pathname;
    logAnalyticsEvent(eventName, pagePath, {
      ...metadata,
      timestamp: new Date().toISOString(),
      viewportWidth: window.innerWidth,
      referrer: document.referrer ? new URL(document.referrer).hostname : "direct"
    });
  } catch {
    // Non-blocking telemetry
  }
}

export function trackPageView(pagePath) {
  trackEvent("page_view", { path: pagePath || window.location.pathname });
}

