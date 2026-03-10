import axios from 'axios';
import apiClient from './apiClient';
import { Booking } from '../hooks/useBookings';

export async function fetchAllBookings(signal: AbortSignal) {
  return await apiClient.get<Booking[]>('/Bookings', { signal });
}

export async function createBooking(newBooking: Omit<Booking, 'id'>) {
  return await apiClient.post<Booking>('/Bookings', newBooking);
}

export async function deleteBooking(id: string) {
  return await apiClient.delete(`/Bookings/${id}`);
}