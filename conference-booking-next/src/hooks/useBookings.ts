import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient';

export interface Booking {
  id: string;
  roomName: string;
  roomLocation: string;
  roomIsActive: boolean;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

interface PagedResult {
  items: Booking[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export function useBookings() {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]         = useState<string | null>(null);
  const [view, setView]           = useState<string>('upcoming');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // apiClient already unwraps response.data, so `result` IS the parsed body
      const result = await apiClient.get<any, PagedResult>('/bookings');
      setBookings(result.items ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addBooking = async (payload: { roomID: string; startTime: string; endTime: string }) => {
    // apiClient unwraps already — result is the created Booking directly
    const created = await apiClient.post<any, Booking>('/bookings', payload);
    setBookings(prev => [created, ...prev]);
  };

  const deleteBooking = async (id: string) => {
    await apiClient.delete(`/bookings/${id}`);
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const cancelBooking = async (id: string) => {
    await apiClient.post(`/bookings/${id}/cancel`, {});
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b)
    );
  };

  // Filter bookings client-side based on selected view
  const filtered = bookings.filter(b => {
    const now = new Date();
    if (view === 'upcoming')  return new Date(b.endTime) >= now && b.status !== 'Cancelled';
    if (view === 'past')      return new Date(b.endTime) <  now;
    if (view === 'cancelled') return b.status === 'Cancelled';
    return true;
  });

  return { bookings: filtered, allBookings: bookings, view, setView, loading, error, addBooking, deleteBooking, cancelBooking, reload: load };
}