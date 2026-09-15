/**
 * AuthContext — Supabase Auth Context
 * Re-exports authentication state and hooks for the portfolio platform.
 */

export {
  AdminAuthProvider as AuthProvider,
  useAdminAuth as useAuth,
  AdminProtectedRoute as ProtectedRoute
} from "./AdminAuthContext";

