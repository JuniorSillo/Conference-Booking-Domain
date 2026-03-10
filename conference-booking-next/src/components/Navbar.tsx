"use client";

import { useState } from 'react';

interface Props {
  onLogout: () => void;
}

function Navbar({ onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-zinc-900 border-b border-gray-200">
      <div className="px-6 flex items-center justify-between h-16">

        {/* Logo / Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            
<div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
</div>

            <span className="text-white/80 font-semibold tracking-tight text-sm">Conference Booking System</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Dashboard</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">My Bookings</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Rooms</a>
          <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-600">Logout</button>
        </div>

        <button className="md:hidden text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-6 py-3 flex flex-col gap-3">
          <a href="#" className="text-sm text-gray-500">Dashboard</a>
          <a href="#" className="text-sm text-gray-500">My Bookings</a>
          <a href="#" className="text-sm text-gray-500">Rooms</a>
          <button onClick={onLogout} className="text-sm text-red-500 text-left">Logout</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;