
import { useState, useEffect } from 'react';
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

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<string>('upcoming');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get<Booking[]>('/Bookings');
        setBookings(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addBooking = async (newBooking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    const saved = await apiClient.post<Booking>('/Bookings', newBooking);
    setBookings(prev => [...prev, saved.data]);
  };

  const deleteBooking = async (id: string) => {
    await apiClient.delete(`/Bookings/${id}`);
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  return { bookings, view, setView, loading, error, addBooking, deleteBooking };
}