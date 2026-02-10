using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ConferenceBooking.Domain.Models;

public record Booking
{
    [Key]
    public Guid Id { get; init; } = Guid.NewGuid();

    public string RoomID { get; init; } = string.Empty;  

    public ConferenceRoom Room { get; init; } = null!;

    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public BookingStatus Status { get; private set; }

    protected Booking() { }

    [JsonConstructor]
    public Booking(Guid id, string roomID, ConferenceRoom room, DateTime startTime, DateTime endTime, BookingStatus status)
    {
        Id = id;
        RoomID = roomID;
        Room = room;
        StartTime = startTime;
        EndTime = endTime;
        Status = status;
    }

    private Booking(ConferenceRoom room, DateTime startTime, DateTime endTime)
    {
        Room = room;
        RoomID = room.RoomID;
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
        $"Booking {Id}\n" +
        $"  Room: {Room?.RoomName ?? "N/A"} ({RoomID})\n" +
        $"  Time: {StartTime:ddd, dd MMM yyyy HH:mm} – {EndTime:HH:mm}\n" +
        $"  Status: {Status}";
}