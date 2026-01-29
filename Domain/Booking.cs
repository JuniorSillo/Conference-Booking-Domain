using System;

namespace ConferenceBooking.Domain.Models;


public record class Booking
{
    // public string BookingId { get; init; }                
    // public string RoomId { get; init; }
    // public string BookedByUserId { get; init; }    
    public ConferenceRoom Room { get; init; }
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public BookingStatus Status { get; private set; }
             
//coneference room, start and end time, booking status
    // Private constructor
    private Booking(
        ConferenceRoom room,
        DateTime startTime,
        DateTime endTime)
    {
        Room = room;
        StartTime = startTime;
        EndTime = endTime;
        Status = BookingStatus.Pending; // New bookings always start as Pending
    }

    public static Booking Create(
        ConferenceRoom room,
        DateTime startTime,
        DateTime endTime,
        string? purpose = null)
    {
        if (room == null)
            throw new ArgumentNullException(nameof(room), "Conference room cannot be null.");

        if (startTime >= endTime)
            throw new ArgumentException("End time must be after start time.");

        if (startTime < DateTime.Now)
            throw new ArgumentException("Start time cannot be in the past.");

        return new Booking(room, startTime, endTime);
    }
    public void UpdateStatus(BookingStatus newStatus)
    {
        // Add any business rules for status transitions here
        Status = newStatus;
    }
}