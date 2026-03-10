"use client";

import { useEffect, useState } from 'react';
import BookingList from './BookingList';
import { useBookings } from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import apiClient from '../lib/apiClient';

interface Room {
  roomID: string;
  roomName: string;
  location: string;
}

export default function BookingPage() {
  const { user } = useAuth();
  const role = user?.roles?.[0] ?? '';
  const canCreate = role === 'Employee' || role === 'Receptionist';

  const { bookings, view, setView, loading, error, addBooking, deleteBooking, cancelBooking } = useBookings();

  const [rooms, setRooms]           = useState<Room[]>([]);
  const [roomId, setRoomId]         = useState('');
  const [startTime, setStartTime]   = useState('');
  const [endTime, setEndTime]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (!canCreate) return;
    apiClient.get<any, any>('/rooms')
      .then(data => setRooms(data?.items ?? data ?? []))
      .catch(() => {});
  }, [canCreate]);

  const handleCreate = async () => {
    if (!roomId || !startTime || !endTime) { setFormError('All fields are required.'); return; }
    setSubmitting(true); setFormError(''); setFormSuccess('');
    try {
      await addBooking({
        roomID:    roomId,
        startTime: new Date(startTime).toISOString(),
        endTime:   new Date(endTime).toISOString(),
      });
      setFormSuccess('✅ Booking created!');
      setRoomId(''); setStartTime(''); setEndTime('');
    } catch (e: any) {
      setFormError(e.response?.data?.message ?? e.message ?? 'Failed to create booking.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  if (error) return (
    <div className="p-6 text-red-400">Error: {error}</div>
  );

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all";

  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Header ── */}
        <h1 className="text-2xl font-semibold text-white tracking-tight">My Bookings</h1>

        {/* ── Create form (Employee / Receptionist only) ── */}
        {canCreate && (
          <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">+</span>
              New Booking
            </h2>

            {formError   && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formError}</p>}
            {formSuccess && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{formSuccess}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Room</label>
                <select value={roomId} onChange={e => setRoomId(e.target.value)} className={inputCls}>
                  <option value="">Select a room…</option>
                  {rooms.map(r => (
                    <option key={r.roomID} value={r.roomID}>{r.roomName} — {r.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Start Time</label>
                <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">End Time</label>
                <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputCls} />
              </div>
            </div>

            <button onClick={handleCreate} disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-2">
              {submitting && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {submitting ? 'Creating…' : 'Create Booking'}
            </button>
          </div>
        )}

        {/* ── View filter tabs ── */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-400">Show:</span>
          <div className="flex gap-2">
            {['upcoming', 'past', 'cancelled'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors capitalize ${
                  view === v
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-white/5'
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bookings list ── */}
        <BookingList
          bookings={bookings}
          view={view}
          onDelete={deleteBooking}
          onCancel={cancelBooking}
        />

      </div>
    </div>
  );
}