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




export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  roles: string[];   
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

// ─── Context 

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  //AuthGuard never flashes a redirect before we know the auth state.
  const [isLoading, setIsLoading] = useState(true);

  
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

  // ── Login 
  const login = useCallback(async (email: string, password: string) => {
    // apiClient response interceptor unwraps response.data already,
    const data = await apiClient.post<any, LoginApiResponse>(
      "/auth/login",
      { email, password }
    );

    const profile: UserProfile = { ...data.user, loggedIn: true };

    // Persist so the session survives a page refresh
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(profile));

    setToken(data.token);
    setUser(profile);
  }, []);

  // ── Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  // (extra credit) 
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return ctx;
}