import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient.js';

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.get('/Bookings');
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addBooking = async (newBooking) => {
    const saved = await apiClient.post('/Bookings', newBooking);
    setBookings(prev => [...prev, saved]);
  };

  const deleteBooking = async (id) => {
    await apiClient.delete(`/Bookings/${id}`);
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  return { bookings, loading, error, addBooking, deleteBooking };
}