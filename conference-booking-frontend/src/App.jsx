import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BookingCard from './components/BookingCard.jsx'
import { bookings } from './data/mockData.js'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <h1>Conference Bookings</h1>
        <p>Here are your upcoming and past bookings.</p>

        <div className="bookings-grid">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App