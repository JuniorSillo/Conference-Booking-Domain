"use client";

import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

export default function ClientNavbar() {
  const { logout } = useAuth();
  return <Navbar onLogout={logout} />;
}