// src/hooks/useBookings.js
import { useState, useEffect } from 'react'
import apiClient from '../api/apiClient.js'  // centralized client

export function useBookings() {
  const [bookings, setBookings] = useState([]);  // initial empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('upcoming');

  useEffect(() => {
    const controller = new AbortController();  // for cancellation

    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get('/Bookings', { signal: controller.signal });
        setBookings(data);  
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Request cancelled:', err.message);
          return;  // ignore cancelled (cleanup)
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          setError('Request timed out — server took too long to respond');
        } else if (err.message.includes('Network Error')) {
          setError('Network error — check your internet or server status');
        } else if (err.response) {
          setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadBookings();

    // Cleanup: abort on unmount or dependency change
    return () => controller.abort();
  }, []);  

    const filteredBookings = () => {
    if (view === 'past') return bookings.filter(b => b.status === 'Completed');
    if (view === 'upcoming') return bookings.filter(b => ['Approved', 'Pending'].includes(b.status));
    if (view === 'cancelled') return bookings.filter(b => b.status === 'Cancelled');
    return bookings;
  };

  // Add booking 
  const addBooking = async (newBooking) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic = { ...newBooking, id: optimisticId };
    setBookings(prev => [...prev, optimistic]);

    try {
      const saved = await apiClient.post('/Bookings', newBooking);
      setBookings(prev => prev.map(b => b.id === optimisticId ? saved : b));
    } catch (err) {
      setBookings(prev => prev.filter(b => b.id !== optimisticId));
      setError('Failed to create booking');
    }
  };

  // Delete booking
  const removeBooking = async (id) => {
    const original = bookings.find(b => b.id === id);
    setBookings(prev => prev.filter(b => b.id !== id));

    try {
      await apiClient.delete(`/Bookings/${id}`);
    } catch (err) {
      if (original) setBookings(prev => [...prev, original]);
      setError('Failed to delete booking');
    }
  };

  return {
    bookings: filteredBookings(),
    loading,
    error,
    view,
    setView,
    addBooking,
    removeBooking
  };
}