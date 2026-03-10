"use client";

import { Booking } from '../hooks/useBookings';

interface Props {
  booking: Booking;
  onDelete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

function BookingCard({ booking, onDelete, onCancel }: Props) {
  const { id, roomName, roomLocation, startTime, endTime, status, createdAt } = booking;

  const isPast = new Date(endTime) < new Date();
  const canAct = !isPast && status !== 'Cancelled' && status !== 'Completed';

  const statusStyles: Record<string, string> = {
    Approved:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    Pending:   'bg-amber-500/15   text-amber-400   border border-amber-500/30',
    Cancelled: 'bg-red-500/15     text-red-400     border border-red-500/30',
    Completed: 'bg-zinc-500/15    text-zinc-400    border border-zinc-500/30',
  };

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
      {/* Room name + past badge */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-white">{roomName}</h3>
        {isPast && (
          <span className="px-2 py-0.5 text-[11px] font-medium text-zinc-400 bg-zinc-700 rounded-full">Past</span>
        )}
      </div>

      {/* Location */}
      {roomLocation && (
        <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
          📍 {roomLocation}
        </p>
      )}

      {/* Times */}
      <div className="text-sm text-zinc-300 space-y-1 mb-3">
        <p><span className="text-zinc-500 font-medium">From:</span> {new Date(startTime).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        <p><span className="text-zinc-500 font-medium">To:</span>   {new Date(endTime).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>

      {/* Status + date */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${statusStyles[status] ?? 'bg-zinc-700 text-zinc-300 border border-zinc-600'}`}>
          {status}
        </span>
        <span className="text-xs text-zinc-600">
          {new Date(createdAt).toLocaleDateString('en-ZA')}
        </span>
      </div>

      {/* Action buttons */}
      {canAct && (onCancel || onDelete) && (
        <div className="flex gap-2 pt-3 border-t border-white/5">
          {onCancel && (
            <button onClick={() => onCancel(id)}
              className="flex-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg py-1.5 transition-colors">
              Cancel
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(id)}
              className="flex-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg py-1.5 transition-colors">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingCard;