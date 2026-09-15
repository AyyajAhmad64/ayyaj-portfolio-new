/**
 * Supabase Client Configuration
 * Initializes the official @supabase/supabase-js client using environment variables.
 * Provides graceful fallback when unconfigured to prevent frontend crashes.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate whether real credentials have been provided.
// Accepts any non-empty string — including the newer sb_publishable_ key format.
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== "" &&
    supabaseAnonKey.trim() !== ""
  );
};

// Safe diagnostic info (never exposes secrets or full keys)
export const getSupabaseDiagnostics = () => {
  let hostname = "";
  try {
    hostname = supabaseUrl ? new URL(supabaseUrl).hostname : "";
  } catch {
    hostname = "invalid-url";
  }
  const keyPrefix = supabaseAnonKey ? supabaseAnonKey.slice(0, 15) : "";
  return {
    SUPABASE_URL: supabaseUrl && supabaseUrl.trim() !== "" ? "configured" : "missing",
    URL_HOSTNAME: hostname,
    SUPABASE_ANON_KEY: supabaseAnonKey && supabaseAnonKey.trim() !== "" ? "configured" : "missing",
    KEY_FORMAT: keyPrefix.startsWith("sb_publishable_") ? "sb_publishable_" : (keyPrefix.startsWith("eyJ") ? "jwt" : (keyPrefix ? "unknown" : "none"))
  };
};

if (typeof window !== "undefined") {
  window.__SUPABASE_DIAGNOSTICS__ = getSupabaseDiagnostics();
}

let clientInstance = null;

if (isSupabaseConfigured()) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined
      }
    });
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
}

export const supabase = clientInstance;

export default supabase;

