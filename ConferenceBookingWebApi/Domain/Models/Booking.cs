using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using ConferenceBookingWebApi.Models;  // ← ADD THIS LINE (for ApplicationUser)

namespace ConferenceBooking.Domain.Models;

public record Booking
{
    [Key]
    public Guid Id { get; init; } = Guid.NewGuid();

    public string RoomID { get; init; } = string.Empty;
    public ConferenceRoom Room { get; init; } = null!;

    public string UserId { get; init; } = string.Empty;
    public ApplicationUser? User { get; init; }  // Now resolves

    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }

    public BookingStatus Status { get; private set; }

    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; private set; }

    protected Booking() { }

    [JsonConstructor]
    public Booking(
        Guid id,
        string roomID,
        ConferenceRoom room,
        string userId,
        DateTime startTime,
        DateTime endTime,
        BookingStatus status,
        DateTime createdAt,
        DateTime? cancelledAt)
    {
        Id = id;
        RoomID = roomID;
        Room = room;
        UserId = userId;
        StartTime = startTime;
        EndTime = endTime;
        Status = status;
        CreatedAt = createdAt;
        CancelledAt = cancelledAt;
    }

    private Booking(ConferenceRoom room, string userId, DateTime startTime, DateTime endTime)
    {
        Room = room;
        RoomID = room.RoomID;
        UserId = userId;
        StartTime = startTime;
        EndTime = endTime;
        Status = BookingStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public static Booking Create(ConferenceRoom room, string userId, DateTime startTime, DateTime endTime)
    {
        if (room == null) throw new ArgumentNullException(nameof(room));
        if (string.IsNullOrEmpty(userId)) throw new ArgumentNullException(nameof(userId));
        if (startTime >= endTime) throw new ArgumentException("End time must be after start time.");
        if (startTime < DateTime.Now) throw new ArgumentException("Cannot book in the past.");

        return new Booking(room, userId, startTime, endTime);
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
        $"  User: {User?.Email ?? UserId}\n" +
        $"  Time: {StartTime:ddd, dd MMM yyyy HH:mm} – {EndTime:HH:mm}\n" +
        $"  Status: {Status}\n" +
        $"  Created: {CreatedAt:yyyy-MM-dd HH:mm}\n" +
        $"  Cancelled: {(CancelledAt.HasValue ? CancelledAt.Value.ToString("yyyy-MM-dd HH:mm") : "N/A")}";
}