// src/services/bookingService.js
//
// Simulates a real REST API:
//  • Random latency between 500ms and 2500ms
//  • 20% failure rate to force error-state handling in the UI
//  • Respects an AbortSignal so in-flight "requests" can be cancelled
//  • Filters by category when provided (mirrors a real query-param filter)

import { pastBookings, upcomingBookings, cancelledBookings } from '../data/mockData';

/**
 * Fetches all bookings from the simulated API.
 *
 * @param {{ signal?: AbortSignal, category?: string }} options
 * @returns {Promise<Array>}
 */
export function fetchAllBookings({ signal, category = 'All' } = {}) {
  const delay = Math.floor(Math.random() * 2000) + 500   // 500–2500 ms
  const shouldFail = Math.random() < 0.2                 // 20% failure rate

  return new Promise((resolve, reject) => {
    // If already aborted before the timer even starts, bail immediately
    if (signal?.aborted) {
      reject(new DOMException('Fetch aborted', 'AbortError'))
      return
    }

    const timer = setTimeout(() => {
      // Check abort again once the delay has elapsed
      if (signal?.aborted) {
        reject(new DOMException('Fetch aborted', 'AbortError'))
        return
      }

      if (shouldFail) {
        reject(new Error('Server Error 503: Failed to fetch bookings. Please try again.'))
        return
      }

      // Combine all mock data groups
      const allBookings = [...pastBookings, ...upcomingBookings, ...cancelledBookings]

      // Apply category filter (mirrors a real API query param)
      const result =
        category === 'All'
          ? allBookings
          : allBookings.filter((b) => b.category === category)

      resolve(result)
    }, delay)

    // If the AbortSignal fires while the timer is still running, cancel it
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Fetch aborted', 'AbortError'))
    })
  })
}