// src/pages/Dashboard.jsx
import BookingForm from '../components/BookingForm.jsx';
import BookingList from '../components/BookingList.jsx'; // or BookingCard grid if you don't have BookingList
import { useBookings } from '../hooks/useBookings.js';

export default function Dashboard() {
  const { bookings, view, setView, addBooking, removeBooking } = useBookings();

  return (
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
  );
}