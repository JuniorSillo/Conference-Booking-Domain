"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until localStorage hydration is complete before deciding to redirect
    if (isLoading) return;

    if (!user?.loggedIn) {
      // Preserve the attempted URL so we can redirect back after login
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [user?.loggedIn, isLoading, router, pathname]);

  // While hydrating, render nothing to avoid a flash of protected content
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-6 h-6 animate-spin text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-zinc-500">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Guest: return null — the useEffect redirect is already in flight
  if (!user?.loggedIn) return null;

  // Authenticated: render the protected content
  return <>{children}</>;
}