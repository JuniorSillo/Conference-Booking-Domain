import Button from './Button.jsx'

function BookingCard({ booking }) {
  const { roomName, roomLocation, startTime, endTime, status, createdAt } = booking

  return (
    <div className="booking-card">
      <h3>{roomName}</h3>
      {roomLocation && <p className="location">{roomLocation}</p>}

      <div className="booking-time">
        <p><strong>From:</strong> {new Date(startTime).toLocaleString()}</p>
        <p><strong>To:</strong> {new Date(endTime).toLocaleString()}</p>
      </div>

      <p className={`status ${status.toLowerCase()}`}>
        Status: {status}
      </p>

      <p className="created">Created: {new Date(createdAt).toLocaleDateString()}</p>

      <div className="card-actions">
        <Button label="View Details" variant="primary" />
        <Button label="Cancel" variant="danger" disabled={status === 'Cancelled'} />
      </div>
    </div>
  )
}

export default BookingCard