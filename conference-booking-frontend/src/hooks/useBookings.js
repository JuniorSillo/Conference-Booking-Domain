
import { useState, useEffect, useMemo } from 'react'
import { fetchAllBookings, createBooking, deleteBooking } from '../services/bookingService.js'

// Storage keys
const API_STORAGE_KEY = 'conference-bookings-api'
const USER_STORAGE_KEY = 'conference-bookings-user'

const readFromStorage = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

const mergeBookings = (apiBookings, userBookings) => {
  const map = new Map()
  apiBookings.forEach(b => map.set(b.id, b))
  userBookings.forEach(b => map.set(b.id, b))
  return Array.from(map.values())
}

export function useBookings() {
  const [apiBookings, setApiBookings] = useState(() => readFromStorage(API_STORAGE_KEY))
  const [userBookings, setUserBookings] = useState(() => readFromStorage(USER_STORAGE_KEY))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('upcoming')

  // Persist
  useEffect(() => { writeToStorage(API_STORAGE_KEY, apiBookings) }, [apiBookings])
  useEffect(() => { writeToStorage(USER_STORAGE_KEY, userBookings) }, [userBookings])

  // Fetch real data on mount
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchAllBookings()
        setApiBookings(data)
        toast.success('Bookings loaded from server')
      } catch (err) {
        setError(err.message)
        console.error('API fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  // Derived merged + filtered
  const allBookings = useMemo(() => mergeBookings(apiBookings, userBookings), [apiBookings, userBookings])

  const filteredBookings = useMemo(() => {
    if (view === 'past') return allBookings.filter(b => b.status === 'Completed')
    if (view === 'upcoming') return allBookings.filter(b => ['Approved', 'Pending'].includes(b.status))
    if (view === 'cancelled') return allBookings.filter(b => b.status === 'Cancelled')
    return allBookings
  }, [allBookings, view])

  // Actions
  const addBooking = async (newBooking) => {
    // Optimistic add
    const optimistic = {
      ...newBooking,
      id: `optimistic-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }
    setUserBookings(prev => [...prev, optimistic])

    try {
      const saved = await createBooking(newBooking)
      // Replace optimistic with real
      setUserBookings(prev => prev.map(b => b.id === optimistic.id ? saved : b))
      setApiBookings(prev => [...prev, saved]) // also add to API cache
    } catch (err) {
      // Rollback on failure
      setUserBookings(prev => prev.filter(b => b.id !== optimistic.id))
      setError('Failed to save booking')
      toast.error('Failed to create booking')
    }
  }

  const removeBooking = async (id) => {
    // Optimistic remove
    const original = allBookings.find(b => b.id === id)
    setUserBookings(prev => prev.filter(b => b.id !== id))
    setApiBookings(prev => prev.filter(b => b.id !== id))

    try {
      await deleteBooking(id)
    } catch (err) {
      // Rollback
      if (original) {
        setUserBookings(prev => [...prev, original])
        setApiBookings(prev => [...prev, original])
      }
      setError('Failed to delete booking')
      toast.error('Failed to delete booking')
    }
  }

  return {
    bookings: filteredBookings,
    loading,
    error,
    view,
    setView,
    addBooking,
    removeBooking
  }
}