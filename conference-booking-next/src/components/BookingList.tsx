"use client";

import BookingCard from './BookingCard';
import { Booking } from '../hooks/useBookings';

interface Props {
  bookings: Booking[];
  view: string;
  category?: string;
  isSyncing?: boolean;
  onDelete: (id: string) => void;
  onCancel?: (id: string) => void;
}

function BookingList({ bookings, view, category, isSyncing = false, onDelete, onCancel }: Props) {
  const viewLabel = view.charAt(0).toUpperCase() + view.slice(1);

  return (
    <div className={isSyncing ? 'opacity-50 pointer-events-none' : ''}>
      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <span className="text-3xl">📭</span>
          <p className="text-sm text-zinc-500">
            No {view} bookings{category && category !== 'All' ? ` in "${category}"` : ''}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onDelete={view === 'upcoming' ? onDelete : undefined}
              onCancel={view === 'upcoming' ? onCancel : undefined}
            />
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-500">
        {viewLabel} bookings: <span className="text-zinc-300 font-medium">{bookings.length}</span>
      </p>
    </div>
  );
}

export default BookingList;