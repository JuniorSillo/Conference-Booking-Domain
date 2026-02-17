import Button from './Button.jsx'

function BookingCard({ booking }) {
  const {
    roomName,
    roomLocation,
    capacity,        
    startTime,
    endTime,
    status,
    createdAt
  } = booking

  
  const isPast = new Date(endTime) < new Date()

  
  const statusClass = `status-badge ${status.toLowerCase()}`

  return (
    <div className="booking-card">
      <div className="card-header">
        <h3>{roomName}</h3>
        {isPast && <span className="past-badge">Past Booking</span>}
      </div>

      {roomLocation && (
        <p className="location">
          <strong>Location:</strong> {roomLocation}
        </p>
      )}

      <p className="capacity">
        <strong>Capacity:</strong> {capacity} people
      </p>

      <div className="booking-time">
        <p>
          <strong>From:</strong> {new Date(startTime).toLocaleString('en-ZA', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })}
        </p>
        <p>
          <strong>To:</strong> {new Date(endTime).toLocaleString('en-ZA', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })}
        </p>
      </div>

      <p className={statusClass}>
        <strong>Status:</strong> {status}
      </p>

      <p className="created">
        <strong>Created:</strong> {new Date(createdAt).toLocaleDateString('en-ZA')}
      </p>

      <div className="card-actions">
        <Button label="View Details" variant="primary" />
        <Button 
          label="Cancel" 
          variant="danger" 
          disabled={isPast || status === 'Cancelled' || status === 'Completed'} 
        />
      </div>
    </div>
  )
}

export default BookingCard