// src/App.jsx
// This file handles state, effects, and data logic only.
// All markup lives in dedicated components — no h1, p, div, etc. here.

import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

import Navbar            from './components/Navbar.jsx'
import Footer            from './components/Footer.jsx'
import LoadingScreen     from './components/LoadingScreen.jsx'
import ErrorScreen       from './components/ErrorScreen.jsx'
import PageHeader        from './components/PageHeader.jsx'
import SyncBanner        from './components/SyncBanner.jsx'
import DashboardControls from './components/DashboardControls.jsx'
import BookingForm       from './components/BookingForm.jsx'
import BookingList from './components/Bookinglist.jsx'
import { fetchAllBookings } from './services/bookingService.js'

// ── Storage helpers ───────────────────────────────────────────────────────────
const API_STORAGE_KEY  = 'conference-bookings-api'
const USER_STORAGE_KEY = 'conference-bookings-user'

function readFromStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch { /* quota errors — silent fail */ }
}

// ── Merge helper ──────────────────────────────────────────────────────────────
// Combines API and user bookings; user bookings win on id collision.
function mergeBookings(apiBookings, userBookings) {
  const map = new Map()
  apiBookings.forEach((b)  => map.set(b.id, b))
  userBookings.forEach((b) => map.set(b.id, b))
  return Array.from(map.values())
}

// ── Filter helper ─────────────────────────────────────────────────────────────
const UPCOMING_STATUSES = new Set(['Approved', 'Pending'])

function filterByView(bookings, view) {
  if (view === 'past')      return bookings.filter((b) => b.status === 'Completed')
  if (view === 'upcoming')  return bookings.filter((b) => UPCOMING_STATUSES.has(b.status))
  if (view === 'cancelled') return bookings.filter((b) => b.status === 'Cancelled')
  return bookings
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [apiBookings,  setApiBookings]  = useState(() => readFromStorage(API_STORAGE_KEY))
  const [userBookings, setUserBookings] = useState(() => readFromStorage(USER_STORAGE_KEY))
  const [staleBookings, setStale]       = useState([])
  const [loading,       setLoading]     = useState(true)
  const [backgroundLoad, setBgLoad]     = useState(false)
  const [error,         setError]       = useState(null)

  const [view,     setView]     = useState('upcoming')
  const [category, setCategory] = useState('All')
  const [fetchTrigger, setFetchTrigger] = useState(0)

  // ── Persist slices separately ─────────────────────────────────────────────
  useEffect(() => { writeToStorage(API_STORAGE_KEY,  apiBookings)  }, [apiBookings])
  useEffect(() => { writeToStorage(USER_STORAGE_KEY, userBookings) }, [userBookings])

  // ── Merge + filter (derived — no effect needed) ───────────────────────────
  const allBookings      = mergeBookings(apiBookings, userBookings)
  const sourceList       = backgroundLoad && staleBookings.length > 0 ? staleBookings : allBookings
  const displayedBookings = filterByView(sourceList, view)

  // ── Fetch effect ──────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController()

    const loadBookings = async () => {
      if (allBookings.length > 0) {
        setStale(allBookings)
        setBgLoad(true)
        setError(null)
      } else {
        setLoading(true)
        setError(null)
      }

      try {
        const data = await fetchAllBookings({ signal: controller.signal, category })

        if (!controller.signal.aborted) {
          setApiBookings(data)  // only the API slice is replaced — user bookings are untouched
          setStale([])
          toast.success('Data sync successful!', { toastId: 'sync-ok' })
        }
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setBgLoad(false)
        }
      }
    }

    loadBookings()
    return () => controller.abort()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, fetchTrigger])
  // apiBookings / userBookings / allBookings intentionally omitted —
  // including them would trigger an infinite loop (the Cloudflare Rule).

  // ── Handlers ──────────────────────────────────────────────────────────────
  const addBooking = (newBooking) => {
    setUserBookings((prev) => [
      ...prev,
      {
        ...newBooking,
        id:        `user-${Date.now()}`,
        status:    'Pending',
        category:  newBooking.category ?? 'Internal',
        createdAt: new Date().toISOString(),
      },
    ])
  }

  const deleteBooking = (id) => {
    setUserBookings((prev) => prev.filter((b) => b.id !== id))
    setApiBookings((prev)  => prev.filter((b) => b.id !== id))
  }

  const triggerRefetch = () => setFetchTrigger((n) => n + 1)

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading && allBookings.length === 0 && staleBookings.length === 0)
    return <LoadingScreen />

  if (error && allBookings.length === 0 && staleBookings.length === 0)
    return <ErrorScreen message={error} onRetry={triggerRefetch} />

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      <main className="main-content">
        <PageHeader isSyncing={backgroundLoad} />

        <SyncBanner
          error={error && allBookings.length > 0 ? error : null}
          isStale={backgroundLoad && staleBookings.length > 0}
          onRetry={triggerRefetch}
        />

        <DashboardControls
          category={category}
          onCategoryChange={setCategory}
          view={view}
          onViewChange={setView}
          onRefresh={triggerRefetch}
          isSyncing={backgroundLoad}
        />

        {view === 'upcoming' && <BookingForm onAddBooking={addBooking} />}

        <BookingList
          bookings={displayedBookings}
          view={view}
          category={category}
          isSyncing={backgroundLoad}
          onDelete={deleteBooking}
        />
      </main>

      <Footer />
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  )
}

export default App