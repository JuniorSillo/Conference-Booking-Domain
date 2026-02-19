// src/components/BookingList.jsx
import BookingCard from './BookingCard.jsx'

function BookingList({ bookings, view, category, isSyncing, onDelete }) {
  const viewLabel = view.charAt(0).toUpperCase() + view.slice(1)

  return (
    <>
      <div className={`bookings-grid ${isSyncing ? 'bookings-stale' : ''}`}>
        {bookings.length === 0 ? (
          <p className="empty-state">
            No {view} bookings{category !== 'All' ? ` in "${category}"` : ''}.
          </p>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onDelete={view === 'upcoming' ? onDelete : null}
            />
          ))
        )}
      </div>

      <p className="total-count">
        {viewLabel} bookings: <strong>{bookings.length}</strong>
      </p>
    </>
  )
}

export default BookingList