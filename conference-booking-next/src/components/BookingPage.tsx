"use client"; // Interactive (state, events)

import BookingForm from './BookingForm';
import BookingCard from './BookingCard';
import { useBookings } from '../hooks/useBookings';

export default function BookingPage() {
  const { bookings, view, setView, addBooking, deleteBooking, loading, error } = useBookings();

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-600">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">View: </label>
        <select value={view} onChange={(e) => setView(e.target.value)} className="mt-1 p-2 border border-gray-300 rounded">
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <BookingForm onAddBooking={addBooking} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map(b => (
          <BookingCard key={b.id} booking={b} onDelete={() => deleteBooking(b.id)} />
        ))}
      </div>
    </div>
  );
}