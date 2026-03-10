// app/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// This file stays a SERVER Component — do NOT add "use client" here.
// The AuthProvider is a Client Component and forms the client boundary;
// everything above it (metadata, html/body shell) stays server-rendered.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import ClientNavbar from "../components/ClientNavbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Conference Booking System",
  description: "Secure booking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/*
          AuthProvider is the client boundary.
          ClientNavbar and all page children can now call useAuth()
          without this layout losing its Server Component benefits.
        */}
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <ClientNavbar />
            <main className="flex-grow p-4">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}