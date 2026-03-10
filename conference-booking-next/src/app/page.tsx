"use client";

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  if (user?.loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-500 text-sm mb-6">You are logged in. Head over to manage your bookings.</p>
          <Link href="/bookings" className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
            Go to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Conference Booking System</h1>
        <p className="text-gray-500 text-sm mb-6">Log in to manage and book conference rooms with ease.</p>
        <Link href="/login" className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          Go to Login
        </Link>
      </div>
    </div>
  );
}