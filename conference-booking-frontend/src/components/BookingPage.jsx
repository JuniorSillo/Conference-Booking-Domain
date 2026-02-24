import BookingForm from '../components/BookingForm.jsx';
import BookingCard from '../components/BookingCard.jsx';
import { useBookings } from '../hooks/useBookings.js';

export default function BookingPage() {
  const { bookings, view, setView, addBooking, removeBooking, loading, error } = useBookings();

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Bookings</h1>
      <div className="view-selector">
        <label>View: </label>
        <select value={view} onChange={(e) => setView(e.target.value)}>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <BookingForm onAddBooking={addBooking} />
      <div className="bookings-grid">
        {bookings.map(b => (
          <BookingCard key={b.id} booking={b} onDelete={() => removeBooking(b.id)} />
        ))}
      </div>
    </div>
  );
}