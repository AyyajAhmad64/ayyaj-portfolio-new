import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const AdminAuthContext = createContext();

const SESSION_KEY = "ayyaj_admin_session";

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return null;
  });

  const isAuthenticated = Boolean(adminUser && adminUser.token);

  const login = async (username, password, remember = false) => {
    // Prepared for real backend POST /api/admin/login
    // Validates against configured environment credentials
    const expectedUser = import.meta.env.VITE_ADMIN_USER || "ayyaj";
    const expectedPass = import.meta.env.VITE_ADMIN_PASS || "ayyaj@dev2026";

    if (username.trim() === expectedUser && password === expectedPass) {
      const session = {
        username: expectedUser,
        role: "admin",
        token: `adm-token-${Date.now()}`,
        loginTime: new Date().toISOString()
      };

      if (remember) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }

      setAdminUser(session);
      return { success: true };
    }

    return { success: false, error: "Invalid username or authorization credential." };
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAuthenticated, login, logout }}>
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
 * Route protection wrapper for all /admin/* endpoints
 */
export function AdminProtectedRoute({ children }) {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

