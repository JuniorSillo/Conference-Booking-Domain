using System;

namespace ConferenceBooking.Domain.Models;

public record class Booking
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public ConferenceRoom Room { get; init; }
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public string? Purpose { get; init; }
    public BookingStatus Status { get; private set; }

    private Booking(
        ConferenceRoom room,
        DateTime startTime,
        DateTime endTime,
        string? purpose)
    {
        Room = room;
        StartTime = startTime;
        EndTime = endTime;
        Purpose = purpose;
        Status = BookingStatus.Pending;
    }

    public static Booking Create(
        ConferenceRoom room,
        DateTime startTime,
        DateTime endTime,
        string? purpose = null)
    {
        if (room == null)
            throw new ArgumentNullException(nameof(room));

        if (startTime >= endTime)
            throw new ArgumentException("End time must be after start time.");

        if (startTime < DateTime.Now)
            throw new ArgumentException("Cannot book in the past.");

        return new Booking(room, startTime, endTime, purpose);
    }

    public void UpdateStatus(BookingStatus newStatus)
    {
        // You can add transition rules later
        Status = newStatus;
    }
}
