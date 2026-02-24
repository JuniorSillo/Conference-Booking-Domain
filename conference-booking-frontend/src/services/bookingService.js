// src/services/bookingService.js
const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  throw new Error("VITE_API_BASE_URL is not defined in .env");
}

// Helper to get token from localStorage
function getToken() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("JWT token is required to fetch bookings.");
  return token;
}

// ── Fetch all bookings ─────────────────────────────────────────────────────
export async function fetchAllBookings(signal = null) {
  const token = getToken();

  const response = await fetch(`${API_BASE}/Bookings`, {
    method: "GET",
    signal,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch bookings: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.items || data;
}

// ── Create a new booking ───────────────────────────────────────────────────
export async function createBooking(newBooking) {
  const token = getToken();

  const response = await fetch(`${API_BASE}/Bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(newBooking),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create booking: ${response.status} - ${errText}`);
  }

  return await response.json();
}

// ── Delete a booking ──────────────────────────────────────────────────────
export async function deleteBooking(id) {
  const token = getToken();

  const response = await fetch(`${API_BASE}/Bookings/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to delete booking: ${response.status} - ${errText}`);
  }
}