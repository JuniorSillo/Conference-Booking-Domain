using System;

namespace ConferenceBooking.Domain.Models;

/// <summary>
/// Represents a single booking request/reservation for a room.
/// Now includes requested capacity and amenities from user input.
/// </summary>
public record class Booking
{
    public string Id { get; init; }
    public ConferenceRoom Room { get; init; }
    public string BookedByUserId { get; init; }
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public int RequestedCapacity { get; init; }
    public RoomAmenity RequestedAmenities { get; init; }
    public BookingStatus Status { get; private set; }
    public string? Purpose { get; init; }

    private Booking(
        string id,
        ConferenceRoom room,
        string bookedByUserId,
        DateTime startTime,
        DateTime endTime,
        int requestedCapacity,
        RoomAmenity requestedAmenities,
        string? purpose = null)
    {
        Id = id;
        Room = room ?? throw new ArgumentNullException(nameof(room));
        BookedByUserId = bookedByUserId;
        StartTime = startTime;
        EndTime = endTime;
        RequestedCapacity = requestedCapacity;
        RequestedAmenities = requestedAmenities;
        Purpose = purpose?.Trim();
        Status = BookingStatus.Pending;
    }

    public static Booking Create(
        string id,
        ConferenceRoom room,
        string bookedByUserId,
        DateTime startTime,
        DateTime endTime,
        int requestedCapacity,
        RoomAmenity requestedAmenities,
        string? purpose = null)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Booking ID required.", nameof(id));

        if (room == null)
            throw new ArgumentNullException(nameof(room));

        if (string.IsNullOrWhiteSpace(bookedByUserId))
            throw new ArgumentException("User ID required.", nameof(bookedByUserId));

        if (startTime >= endTime)
            throw new ArgumentException("Start time must be before end time.");

        var duration = endTime - startTime;
        if (duration.TotalMinutes < 15)
            throw new ArgumentException("Booking must be at least 15 minutes long.");

        if (requestedCapacity < 1)
            throw new ArgumentException("Requested capacity must be at least 1.", nameof(requestedCapacity));

        // Validate against room
        if (requestedCapacity > room.Capacity)
            throw new ArgumentException($"Requested capacity ({requestedCapacity}) exceeds room capacity ({room.Capacity}).");

        if ((requestedAmenities & room.Amenities) != requestedAmenities)
            throw new ArgumentException("Requested amenities are not fully available in this room.");

        return new Booking(id, room, bookedByUserId, startTime, endTime, requestedCapacity, requestedAmenities, purpose);
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
        $"(Room {Room.Name} [{Room.Id}], Req.Cap: {RequestedCapacity}, Req.Amen: {RequestedAmenities}, " +
        $"Status: {Status}, By: {BookedByUserId})";
}