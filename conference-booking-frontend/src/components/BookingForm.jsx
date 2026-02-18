import { useState } from 'react'
import Button from './Button.jsx'

function BookingForm({ onAddBooking }) {
  const [roomName, setRoomName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    
    if (!roomName.trim() || !startTime || !endTime) {
      setError('Please fill in all fields')
      return
    }

    if (new Date(endTime)  <=  new Date(startTime)) {
      setError('End time must be after start time')
      return
    }

    // Create new booking object
    const newBooking = {
      roomName,
      startTime,
      endTime,
      status: 'Pending',
      createdAt: new Date().toISOString()
    }

    onAddBooking(newBooking)

    // Clear form
    setRoomName('')
    setStartTime('')
    setEndTime('')
    setError('')
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2>New Booking</h2>

      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label>Room Name</label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="e.g. Ocean View"
        />
      </div>

      <div className="form-group">
        <label>Start Time</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>End Time</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <Button label="Clear" variant="text" onClick={() => {
          setRoomName('')
          setStartTime('')
          setEndTime('')
          setError('')
        }} />
        <Button label="Book Room" variant="primary" type="submit" />
      </div>
    </form>
  )
}

export default BookingForm