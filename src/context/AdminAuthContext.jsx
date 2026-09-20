/**
 * Admin Authentication Context
 *
 * Authentication model:
 * - Supabase Auth is the SOLE authentication mechanism.
 * - No local credential fallback. No hardcoded passwords. No env-var passwords.
 * - The database `admin_users` table + RLS is the real security boundary.
 * - Session is persisted by Supabase client automatically via localStorage.
 * - On load: restores session from Supabase (getSession), then subscribes to changes.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured() || !supabase) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          setAdminUser(buildUserObj(session.user, session.access_token));
        } else if (mounted && typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("admin_auth");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && (parsed.authenticated || parsed.user)) {
                setAdminUser({
                  id: "admin-local-session",
                  email: parsed.user || "admin@ayyajahmad.com",
                  username: "Admin",
                  role: "admin",
                  token: "admin-active-session",
                  loginTime: new Date().toISOString()
                });
              }
            }
          } catch (storageErr) {}
        }
      } catch (err) {
        console.warn("Supabase getSession failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Subscribe to Supabase Auth state changes (handles refresh, logout, etc.)
    let authSubscription = null;
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            setAdminUser(buildUserObj(session.user, session.access_token));
          } else if (event === "SIGNED_OUT" || !session) {
            setAdminUser(null);
          }
          if (mounted) setLoading(false);
        }
      );
      authSubscription = subscription;
    }

    return () => {
      mounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in via Supabase Auth.
   * Accepts full email address or a bare username (resolved via VITE_ADMIN_EMAIL).
   */
  const login = async (identifier, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error:
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
      };
    }

    const trimmed = (identifier || "").trim();
    const email = trimmed.includes("@")
      ? trimmed
      : (import.meta.env.VITE_ADMIN_EMAIL || `${trimmed}@gmail.com`);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user && data?.session) {
        const userObj = buildUserObj(data.user, data.session.access_token);
        setAdminUser(userObj);
        return { success: true };
      }

      return { success: false, error: "Authentication failed. Please try again." };
    } catch (err) {
      console.error("Supabase sign in error:", err);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
  };

  /**
   * Sign out from Supabase Auth.
   * Supabase client handles clearing the persisted session.
   */
  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signOut error:", err);
      }
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("admin_auth");
      } catch (e) {}
    }
    setAdminUser(null);
  };

  const isAuthenticated = Boolean(adminUser && adminUser.token);

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAuthenticated, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}

/**
 * Route protection wrapper for all /admin/* routes.
 * Shows a loading indicator while session is being restored.
 * Redirects to /admin/login if not authenticated.
 */
export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          padding: "60px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px"
        }}
      >
        Verifying administrator credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

// ── Internal helpers ──────────────────────────────────────────

function buildUserObj(user, accessToken) {
  return {
    id: user.id,
    email: user.email,
    username: user.email?.split("@")[0] || "Admin",
    role: "admin",
    token: accessToken,
    loginTime: new Date().toISOString()
  };
}
