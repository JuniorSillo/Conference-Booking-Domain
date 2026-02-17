import Button from './Button.jsx'

function BookingCard({ booking, onDelete }) {
  const {
    roomName,
    roomLocation,
    startTime,
    endTime,
    status,
    createdAt
  } = booking

  const isPast = new Date(endTime) < new Date()
  const canCancel = !isPast && status !== 'Cancelled' && status !== 'Completed'

  return (
    <div className="booking-card">
      <div className="card-header">
        <h3>{roomName}</h3>
        {isPast && <span className="past-badge">Past</span>}
      </div>

      {roomLocation && <p className="location">{roomLocation}</p>}

      <div className="booking-time">
        <p><strong>From:</strong> {new Date(startTime).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        <p><strong>To:</strong> {new Date(endTime).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>

      <p className={`status-badge ${status.toLowerCase()}`}>
        Status: {status}
      </p>

      <p className="created">
        Created: {new Date(createdAt).toLocaleDateString('en-ZA')}
      </p>

      <div className="card-actions">
        <Button label="View Details" variant="primary" />
        {canCancel && onDelete && (
          <Button 
            label="Cancel" 
            variant="danger" 
            onClick={() => onDelete(booking.id)}
          />
        )}
      </div>
    </div>
  )
}

export default BookingCard