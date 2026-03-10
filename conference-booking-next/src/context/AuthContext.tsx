"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import apiClient, { setAuthLogout } from "../lib/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

// Matches exactly what your API returns inside the "user" object
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  roles: string[];    // e.g. ["Admin"]
  loggedIn: boolean;
}

// The full login response from POST /api/auth/login
interface LoginApiResponse {
  token: string;
  expires: string;
  user: Omit<UserProfile, "loggedIn">;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  // isLoading stays true until localStorage hydration is complete,
  // so AuthGuard never flashes a redirect before we know the auth state.
  const [isLoading, setIsLoading] = useState(true);

  // ── Hydrate from localStorage on first mount ──────────────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted storage — wipe it silently
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    // apiClient response interceptor unwraps response.data already,
    // so `data` is the parsed JSON body directly.
    const data = await apiClient.post<any, LoginApiResponse>(
      "/auth/login",
      { email, password }
    );

    // Attach loggedIn flag so any component can do a simple user?.loggedIn check
    const profile: UserProfile = { ...data.user, loggedIn: true };

    // Persist so the session survives a page refresh
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(profile));

    setToken(data.token);
    setUser(profile);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  // ── Wire Axios 401 interceptor to context logout (extra credit) ───────────
  // Must be declared AFTER logout above.
  useEffect(() => {
    setAuthLogout(logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── useAuth Hook ─────────────────────────────────────────────────────────────

/**
 * Consume auth state from any Client Component:
 *   const { user, login, logout, token, isLoading } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return ctx;
}