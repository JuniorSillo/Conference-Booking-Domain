import { useState } from 'react'
import Button from './Button.jsx'

function BookingForm({ onAddBooking }) {
  const [roomName, setRoomName]   = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime]     = useState('')

  
  const [submitted, setSubmitted] = useState(false)

  
  const errors = {
    roomName:  !roomName.trim()  ? 'Room name is required' : null,
    startTime: !startTime        ? 'Start time is required' : null,
    endTime:   !endTime          ? 'End time is required'
               : (startTime && new Date(startTime) >= new Date(endTime))
               ? 'End time must be after start time'
               : null,
  }

  const hasErrors = Object.values(errors).some(Boolean)

  // Submit 
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (hasErrors) return

    onAddBooking({
      roomName,
      startTime,
      endTime,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    })

    handleClear()
  }

  const handleClear = () => {
    setRoomName('')
    setStartTime('')
    setEndTime('')
    setSubmitted(false)
  }

  // Helper: should this field show its error?
  const fieldError = (key) => submitted && errors[key]

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <h2>New Booking</h2>

      {/* Summary banner */}
      {submitted && hasErrors && (
        <div className="form-error-banner" role="alert">
          <span className="form-error-icon">!</span>
          Please fill in all required fields before submitting.
        </div>
      )}

      {/* Room Name */}
      <div className={`form-group ${fieldError('roomName') ? 'form-group--error' : ''}`}>
        <label htmlFor="roomName">
          Room Name <span className="required-star">*</span>
        </label>
        <input
          id="roomName"
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="e.g. Ocean View"
          aria-invalid={!!fieldError('roomName')}
          aria-describedby={fieldError('roomName') ? 'roomName-error' : undefined}
        />
        {fieldError('roomName') && (
          <span className="field-error" id="roomName-error" role="alert">
            {errors.roomName}
          </span>
        )}
      </div>

      {/* Start Time */}
      <div className={`form-group ${fieldError('startTime') ? 'form-group--error' : ''}`}>
        <label htmlFor="startTime">
          Start Time <span className="required-star">*</span>
        </label>
        <input
          id="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          aria-invalid={!!fieldError('startTime')}
          aria-describedby={fieldError('startTime') ? 'startTime-error' : undefined}
        />
        {fieldError('startTime') && (
          <span className="field-error" id="startTime-error" role="alert">
            {errors.startTime}
          </span>
        )}
      </div>

      {/* End Time */}
      <div className={`form-group ${fieldError('endTime') ? 'form-group--error' : ''}`}>
        <label htmlFor="endTime">
          End Time <span className="required-star">*</span>
        </label>
        <input
          id="endTime"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          aria-invalid={!!fieldError('endTime')}
          aria-describedby={fieldError('endTime') ? 'endTime-error' : undefined}
        />
        {fieldError('endTime') && (
          <span className="field-error" id="endTime-error" role="alert">
            {errors.endTime}
          </span>
        )}
      </div>

      <div className="form-actions">
        <Button label="Clear" variant="text" type="button" onClick={handleClear} />
        <Button label="Book Room" variant="primary" type="submit" />
      </div>
    </form>
  )
}

export default BookingForm