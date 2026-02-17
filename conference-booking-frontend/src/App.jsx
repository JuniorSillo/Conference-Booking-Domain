import { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BookingCard from './components/BookingCard.jsx'
import BookingForm from './components/BookingForm.jsx'
import { pastBookings, upcomingBookings, cancelledBookings } from './data/mockData.js'
import './App.css'

const STORAGE_KEY = 'conference-bookings'

function App() {
 
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved bookings', e)
      }
    }
    
    return [...upcomingBookings]
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
  }, [bookings])

  const [view, setView] = useState('upcoming')

  let displayedBookings = []
  if (view === 'past') displayedBookings = pastBookings
  else if (view === 'upcoming') displayedBookings = bookings
  else if (view === 'cancelled') displayedBookings = cancelledBookings

  const addBooking = (newBooking) => {
    const bookingWithId = {
      ...newBooking,
      id: `booking-${Date.now()}`
    }
    setBookings(prev => [...prev, bookingWithId])
  }

  const deleteBooking = (idToDelete) => {
    setBookings(prev => prev.filter(b => b.id !== idToDelete))
  }

  
  const refreshBookings = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setBookings(JSON.parse(saved))
      } catch (e) {
        console.error('Refresh failed', e)
      }
    }
  }

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <h1>My Bookings</h1>

        <div className="view-selector">
          <label>View: </label>
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Refresh button */}
          <button className="refresh-btn" onClick={refreshBookings}>
            Refresh
          </button>
        </div>

        {view === 'upcoming' && (
          <BookingForm onAddBooking={addBooking} />
        )}

        <div className="bookings-grid">
          {displayedBookings.length === 0 ? (
            <p>No bookings in this category.</p>
          ) : (
            displayedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onDelete={view === 'upcoming' ? deleteBooking : null}
              />
            ))
          )}
        </div>

        <p className="total-count">
          Total {view} bookings: <strong>{displayedBookings.length}</strong>
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default App