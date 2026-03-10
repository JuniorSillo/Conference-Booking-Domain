"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ClientNavbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Build initials from fullName, fall back to first letter of email
  const initials = user?.fullName?.trim()
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  // Display name: fullName if available, otherwise email
  const displayName = user?.fullName?.trim() || user?.email;

  // Primary role badge
  const role = user?.roles?.[0];

  return (
    <nav className="bg-zinc-900 border-b border-white/5">
      <div className="px-6 flex items-center justify-between h-16">

        {/* ── Brand ── */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-white/80 font-semibold tracking-tight text-sm">
            Conference Booking System
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden md:flex items-center gap-6">
          {user?.loggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/bookings" className="text-sm text-zinc-400 hover:text-white transition-colors">
                My Bookings
              </Link>
              <Link href="/rooms" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Rooms
              </Link>

              {/* Profile pill */}
              <div className="flex items-center gap-2.5 pl-4 border-l border-white/10">
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs font-medium text-indigo-300">
                  {initials}
                </div>

                {/* Name + role */}
                <div className="flex flex-col leading-tight">
                  <span className="text-sm text-zinc-300 max-w-[120px] truncate">{displayName}</span>
                  {role && (
                    <span className="text-[10px] text-indigo-400 font-medium">{role}</span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden text-zinc-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 px-6 py-4 flex flex-col gap-4 bg-zinc-900">
          {user?.loggedIn ? (
            <>
              {/* User identity row */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs font-medium text-indigo-300">
                  {initials}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm text-zinc-300 truncate">{displayName}</span>
                  {role && (
                    <span className="text-[10px] text-indigo-400 font-medium">{role}</span>
                  )}
                </div>
              </div>

              <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/bookings" className="text-sm text-zinc-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                My Bookings
              </Link>
              <Link href="/rooms" className="text-sm text-zinc-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                Rooms
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="text-sm text-red-400 hover:text-red-300 text-left transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}