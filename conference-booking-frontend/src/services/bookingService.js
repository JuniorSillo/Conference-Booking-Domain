// src/services/bookingService.js
const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is not defined in .env');
}

export async function fetchAllBookings(signal = null) {
  const response = await fetch(`${API_BASE}/Bookings`, {
    method: 'GET',
    signal,
    headers: {
      'Content-Type': 'application/json',
      // If you have JWT auth later: 'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch bookings: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  // Assuming your backend returns { items: [...], totalCount, ... }
  return data.items || data; // fallback to direct array if not paged
}

export async function createBooking(newBooking, token = null) {
  const response = await fetch(`${API_BASE}/Bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(newBooking),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create booking: ${response.status} - ${errText}`);
  }

  return await response.json();
}

export async function deleteBooking(id, token = null) {
  const response = await fetch(`${API_BASE}/Bookings/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete booking: ${response.status}`);
  }
}