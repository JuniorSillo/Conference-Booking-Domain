using System;
using System.Text.Json.Serialization;

namespace ConferenceBooking.Domain.Models;

public record Booking
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public ConferenceRoom Room { get; init; } = null!;
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public BookingStatus Status { get; private set; }

    // Constructor for JSON deserialization
    [JsonConstructor]
    public Booking(
        Guid id,
        ConferenceRoom room,
        DateTime startTime,
        DateTime endTime,
        BookingStatus status)
    {
        Id = id;
        Room = room;
        StartTime = startTime;
        EndTime = endTime;
        Status = status;
    }

    private Booking(ConferenceRoom room, DateTime startTime, DateTime endTime)
    {
        Room = room;
        StartTime = startTime;
        EndTime = endTime;
        Status = BookingStatus.Pending;
    }

    public static Booking Create(ConferenceRoom room, DateTime startTime, DateTime endTime)
    {
        if (room == null) throw new ArgumentNullException(nameof(room));
        if (startTime >= endTime) throw new ArgumentException("End time must be after start time.");
        if (startTime < DateTime.Now) throw new ArgumentException("Cannot book in the past.");

        return new Booking(room, startTime, endTime);
    }

    public void UpdateStatus(BookingStatus newStatus)
    {
        Status = newStatus;
    }

    public override string ToString() =>
        $"Booking {Id.ToString("N")[..8].ToUpper()}...\n" +
        $"  Room: {Room.RoomName} ({Room.RoomID})\n" +
        $"  Capacity: {Room.Capacity} | Type: {Room.RoomType}\n" +
        $"  Amenities: {Room.Amenities}\n" +
        $"  Time: {StartTime:ddd, dd MMM yyyy HH:mm} – {EndTime:HH:mm}\n" +
        $"  Status: {Status}";

    protected Booking() { }
}