// src/services/bookingService.js
import apiClient from '../api/apiClient.js';  // all through singleton

export async function fetchAllBookings(signal) {
  return await apiClient.get('/Bookings', { signal });  // interceptor unwraps
}

export async function createBooking(newBooking) {
  return await apiClient.post('/Bookings', newBooking);
}

export async function deleteBooking(id) {
  return await apiClient.delete(`/Bookings/${id}`);
}