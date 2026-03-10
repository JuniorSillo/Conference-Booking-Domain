"use client"; 
import { useState } from 'react';
import Button from './Button';
import { Booking } from '../hooks/useBookings';

interface Props {
  onAddBooking: (newBooking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => Promise<void>;
}

function BookingForm({ onAddBooking }: Props) {
  const [roomName, setRoomName] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const errors = {
    roomName: !roomName.trim() ? 'Room name is required' : null,
    startTime: !startTime ? 'Start time is required' : null,
    endTime: !endTime ? 'End time is required'
      : (startTime && new Date(startTime) >= new Date(endTime))
      ? 'End time must be after start time'
      : null,
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    await onAddBooking({
      roomName,
      roomLocation: '',
      roomIsActive: true,
      startTime,
      endTime,
    });

    handleClear();
  };

  const handleClear = () => {
    setRoomName('');
    setStartTime('');
    setEndTime('');
    setSubmitted(false);
  };

  const fieldError = (key: keyof typeof errors) => submitted && errors[key];

  return (
    <form className="p-6 bg-white border border-gray-200 rounded-lg shadow-md" onSubmit={handleSubmit} noValidate>
      <h2 className="text-xl font-bold mb-4">New Booking</h2>

      {submitted && hasErrors && (
        <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded" role="alert">
          <span className="font-bold mr-1">!</span>
          Please fill in all required fields before submitting.
        </div>
      )}

      {/* Room Name */}
      <div className={`mb-4 ${fieldError('roomName') ? 'border-red-500' : ''}`}>
        <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
          Room Name <span className="text-red-500">*</span>
        </label>
        <input
          id="roomName"
          type="text"
          className="mt-1 w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="e.g. Ocean View"
          aria-invalid={!!fieldError('roomName')}
          aria-describedby={fieldError('roomName') ? 'roomName-error' : undefined}
        />
        {fieldError('roomName') && (
          <span id="roomName-error" className="text-sm text-red-600 mt-1" role="alert">
            {errors.roomName}
          </span>
        )}
      </div>

      {/* Start Time */}
      <div className={`mb-4 ${fieldError('startTime') ? 'border-red-500' : ''}`}>
        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
          Start Time <span className="text-red-500">*</span>
        </label>
        <input
          id="startTime"
          type="datetime-local"
          className="mt-1 w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          aria-invalid={!!fieldError('startTime')}
          aria-describedby={fieldError('startTime') ? 'startTime-error' : undefined}
        />
        {fieldError('startTime') && (
          <span id="startTime-error" className="text-sm text-red-600 mt-1" role="alert">
            {errors.startTime}
          </span>
        )}
      </div>

      {/* End Time */}
      <div className={`mb-4 ${fieldError('endTime') ? 'border-red-500' : ''}`}>
        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
          End Time <span className="text-red-500">*</span>
        </label>
        <input
          id="endTime"
          type="datetime-local"
          className="mt-1 w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          aria-invalid={!!fieldError('endTime')}
          aria-describedby={fieldError('endTime') ? 'endTime-error' : undefined}
        />
        {fieldError('endTime') && (
          <span id="endTime-error" className="text-sm text-red-600 mt-1" role="alert">
            {errors.endTime}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button label="Clear" variant="text" type="button" onClick={handleClear} />
        <Button label="Book Room" variant="primary" type="submit" />
      </div>
    </form>
  );
}

export default BookingForm;