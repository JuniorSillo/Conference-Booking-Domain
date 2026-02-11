using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ConferenceBooking.Domain.Models;

public record Booking
{
    [Key]
    public Guid Id { get; init; } = Guid.NewGuid();

    public string RoomID { get; init; } = string.Empty;         // Scalar foreign key

    public ConferenceRoom Room { get; init; } = null!;          // Navigation property

    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }

    public BookingStatus Status { get; private set; }

    
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; private set; }

    // Required by EF Core
    protected Booking() { }

    [JsonConstructor]
    public Booking(
        Guid id,
        string roomID,
        ConferenceRoom room,
        DateTime startTime,
        DateTime endTime,
        BookingStatus status,
        DateTime createdAt,
        DateTime? cancelledAt)
    {
        Id = id;
        RoomID = roomID;
        Room = room;
        StartTime = startTime;
        EndTime = endTime;
        Status = status;
        CreatedAt = createdAt;
        CancelledAt = cancelledAt;
    }

    private Booking(ConferenceRoom room, DateTime startTime, DateTime endTime)
    {
        Room = room;
        RoomID = room.RoomID;
        StartTime = startTime;
        EndTime = endTime;
        Status = BookingStatus.Pending;
        CreatedAt = DateTime.UtcNow;
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

        if (newStatus == BookingStatus.Cancelled)
            CancelledAt = DateTime.UtcNow;
    }

    public override string ToString() =>
        $"Booking {Id}\n" +
        $"  Room: {Room?.RoomName ?? "N/A"} ({RoomID})\n" +
        $"  Time: {StartTime:ddd, dd MMM yyyy HH:mm} – {EndTime:HH:mm}\n" +
        $"  Status: {Status}\n" +
        $"  Created: {CreatedAt:yyyy-MM-dd HH:mm}\n" +
        $"  Cancelled: {(CancelledAt.HasValue ? CancelledAt.Value.ToString("yyyy-MM-dd HH:mm") : "N/A")}";
}