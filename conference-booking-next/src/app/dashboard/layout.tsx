// app/dashboard/layout.tsx
// Placing AuthGuard here protects ALL routes under /dashboard/* automatically.
// This file itself needs "use client" only if it uses hooks directly —
// since AuthGuard is already a Client Component, we can keep this as a
// lightweight Server Component wrapper.

import AuthGuard from "../../components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}