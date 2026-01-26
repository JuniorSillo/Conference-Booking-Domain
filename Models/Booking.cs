using System;

namespace ConferenceBooking.Domain.Models;


public record class Booking
{
    public string BookingId { get; init; }                
    public string RoomId { get; init; }
    public string BookedByUserId { get; init; }        // Who made the request
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public BookingStatus Status { get; private set; }
    public string? Purpose { get; init; }              

    // Private constructor
    private Booking(
        string bookingid,
        string roomId,
        string bookedByUserId,
        DateTime startTime,
        DateTime endTime,
        string? purpose = null)
    {
        BookingId = bookingid;
        RoomId = roomId;
        BookedByUserId = bookedByUserId;
        StartTime = startTime;
        EndTime = endTime;
        Purpose = purpose?.Trim();
        Status = BookingStatus.Pending; // New bookings always start as Pending
    }

    
    public static Booking Create(
        string bookingid,
        string roomId,
        string bookedByUserId,
        DateTime startTime,
        DateTime endTime,
        string? purpose = null)
    {
        if (string.IsNullOrWhiteSpace(bookingid))
            throw new ArgumentException("Booking ID required!", nameof(bookingid));

        if (string.IsNullOrWhiteSpace(roomId))
            throw new ArgumentException("Room ID required!", nameof(roomId));

        if (string.IsNullOrWhiteSpace(bookedByUserId))
            throw new ArgumentException("User ID required!", nameof(bookedByUserId));

        if (startTime >= endTime)
            throw new ArgumentException("Start time must be before end time!");

        var duration = endTime - startTime;
        if (duration.TotalMinutes < 15)
            throw new ArgumentException("Booking must be at least 15 minutes long!");

        return new Booking(bookingid, roomId, bookedByUserId, startTime, endTime, purpose);
    }

    public void ChangeStatus(BookingStatus newStatus)
    {
       
        if (Status == BookingStatus.Completed)
            throw new InvalidOperationException("Cannot change status of a completed booking.");

        if (newStatus == BookingStatus.Pending)
            throw new InvalidOperationException("Cannot revert to Pending.");

        Status = newStatus;
    }

    public bool OverlapsWith(DateTime otherStart, DateTime otherEnd)
    {
       
        return StartTime < otherEnd && otherStart < EndTime;
    }

    public override string ToString() =>
        $"{Purpose ?? "Untitled"} – {StartTime:yyyy-MM-dd HH:mm} → {EndTime:HH:mm} " +
        $"(Room {RoomId}, Status: {Status}, By: {BookedByUserId})";
}