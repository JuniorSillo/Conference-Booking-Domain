import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BookingCard from './components/BookingCard.jsx'
import BookingForm from './components/BookingForm.jsx'
import LoginForm from './components/LoginForm.jsx' // <-- import LoginForm
import { useBookings } from './hooks/useBookings.js'

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || null)
  const {
    bookings,
    loading,
    error,
    view,
    setView,
    addBooking,
    removeBooking,
    fetchBookings
  } = useBookings(token) // <-- pass token to hook

  // Fetch bookings automatically after login
  useEffect(() => {
    if (token) {
      fetchBookings()
        .catch((err) => toast.error(`Failed to fetch bookings: ${err.message}`))
    }
  }, [token])

  // Handle login
  const handleLogin = (jwtToken) => {
    setToken(jwtToken)
    localStorage.setItem('jwtToken', jwtToken)
    toast.success('Login successful!')
  }

  // Handle logout
  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('jwtToken')
    toast.info('Logged out')
  }

  // Show login form if user is not logged in
  if (!token) {
    return (
      <div className="app-container">
        {/* <Navbar /> */}
        <main className="main-content">
          <LoginForm onLogin={handleLogin} />
        </main>
        {/* <Footer /> */}
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    )
  }

  // Loading and error states for bookings
  if (loading) return <div className="loading">Loading bookings from server...</div>
  if (error)
    return (
      <div className="error">
        Error: {error}{' '}
        <button onClick={() => fetchBookings()}>Retry</button>
      </div>
    )

  // Main bookings view
  return (
    <div className="app-container">
      <Navbar onLogout={handleLogout} />

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

        {view === 'upcoming' && <BookingForm onAddBooking={addBooking} token={token} />}

        <div className="bookings-grid">
          {bookings.length === 0 ? (
            <p>No bookings in this category.</p>
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onDelete={() => removeBooking(booking.id, token)}
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