"use client";

import { useState } from 'react';

interface Props {
  onLogout: () => void;
}

function Navbar({ onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-6 flex items-center justify-between h-16">

        <span className="font-semibold text-gray-900 text-lg">Conference Bookings</span>

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