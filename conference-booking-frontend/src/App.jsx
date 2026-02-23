import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BookingCard from './components/BookingCard.jsx'
import BookingForm from './components/BookingForm.jsx'
import { useBookings } from './hooks/useBookings.js'

function App() {
  const {
    bookings,
    loading,
    error,
    view,
    setView,
    addBooking,
    removeBooking
  } = useBookings()

  if (loading) return <div className="loading">Loading bookings from server...</div>
  if (error) return <div className="error">Error: {error} <button onClick={() => window.location.reload()}>Retry</button></div>

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
        </div>

        {view === 'upcoming' && <BookingForm onAddBooking={addBooking} />}

        <div className="bookings-grid">
          {bookings.length === 0 ? (
            <p>No bookings in this category.</p>
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onDelete={() => removeBooking(booking.id)}
              />
            ))
          )}
        </div>

        <p className="total-count">
          Total {view} bookings: <strong>{bookings.length}</strong>
        </p>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  )
}

export default App