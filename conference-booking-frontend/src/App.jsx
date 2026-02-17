import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BookingCard from './components/BookingCard.jsx'
import { pastBookings, upcomingBookings, cancelledBookings } from './data/mockData.js'  // ← FIXED: import the grouped data
import './App.css'

function App() {
  const [view, setView] = useState('upcoming')

  
  let displayedBookings = []
  if (view === 'past') displayedBookings = pastBookings
  else if (view === 'upcoming') displayedBookings = upcomingBookings
  else if (view === 'cancelled') displayedBookings = cancelledBookings

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <h1>My Bookings</h1>

        {/* Dropdown to switch between Past / Upcoming / Cancelled */}
        <div className="view-selector">
          <label>View: </label>
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Show bookings or a message if empty */}
        <div className="bookings-grid">
          {displayedBookings.length === 0 ? (
            <p>No bookings in this category.</p>
          ) : (
            displayedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App