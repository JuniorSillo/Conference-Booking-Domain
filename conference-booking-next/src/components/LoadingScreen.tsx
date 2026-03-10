"use client";


import LoadingSpinner from './LoadingSpinner';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <LoadingSpinner />
      <p className="mt-4 text-gray-600">Fetching your bookings…</p>
    </div>
  );
}