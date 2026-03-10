"use client"; 
import Button from './Button';
import { Booking } from '../hooks/useBookings';

interface Props {
  booking: Booking;
  onDelete?: (id: string) => void;
}

function BookingCard({ booking, onDelete }: Props) {
  const {
    roomName,
    roomLocation,
    startTime,
    endTime,
    status,
    createdAt
  } = booking;

  const isPast = new Date(endTime) < new Date();
  const canCancel = !isPast && status !== 'Cancelled' && status !== 'Completed';

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{roomName}</h3>
        {isPast && <span className="px-2 py-1 text-sm text-white bg-gray-500 rounded">Past</span>}
      </div>

      {roomLocation && <p className="text-sm text-gray-600 mb-2">{roomLocation}</p>}

      <div className="mb-2">
        <p><strong>From:</strong> {new Date(startTime).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        <p><strong>To:</strong> {new Date(endTime).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>

      <p className={`px-2 py-1 text-sm text-white bg-blue-500 rounded inline-block mb-2`}>
        Status: {status}
      </p>

      <p className="text-sm text-gray-500 mb-4">
        Created: {new Date(createdAt).toLocaleDateString('en-ZA')}
      </p>

      <div className="flex gap-2">
        <Button label="View Details" variant="primary" />
        {canCancel && onDelete && (
          <Button 
            label="Cancel" 
            variant="danger" 
            onClick={() => onDelete(booking.id)}
          />
        )}
      </div>
    </div>
  );
}

export default BookingCard;