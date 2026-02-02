using System;

namespace ConferenceBooking.Domain.Models;

public record class ConferenceRoom
{
    public string RoomID { get; init; }
    public string RoomName { get; private set; }
    public int Capacity { get; private set; }
    public RoomType RoomType { get; private set; }
    public RoomAmenity Amenities { get; private set; }

    // Private constructor
    private ConferenceRoom(
        string roomId,
        string roomName,
        int capacity,
        RoomType roomType,
        RoomAmenity amenities)
    {
        RoomID = roomId;
        RoomName = roomName;
        Capacity = capacity;
        RoomType = roomType;
        Amenities = amenities;
    }

    public static ConferenceRoom Create(
        string roomId,
        string roomName,
        int capacity,
        RoomType roomType = RoomType.Standard,
        RoomAmenity amenities = RoomAmenity.None)
    {
        if (string.IsNullOrWhiteSpace(roomId))
            throw new ArgumentException("Room ID cannot be empty.", nameof(roomId));

        if (string.IsNullOrWhiteSpace(roomName))
            throw new ArgumentException("Room name cannot be empty.", nameof(roomName));

        if (capacity < 1)
            throw new ArgumentException("Capacity must be at least 1.", nameof(capacity));

        return new ConferenceRoom(
            roomId.Trim(),
            roomName.Trim(),
            capacity,
            roomType,
            amenities);
    }

    public void UpdateName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Name cannot be empty.");
        RoomName = newName.Trim();
    }

    public bool HasAmenity(RoomAmenity amenity) => (Amenities & amenity) == amenity;

    public override string ToString() =>
        $"{RoomName} ({RoomID}) – Capacity: {Capacity}, Type: {RoomType}, Amenities: {Amenities}";
}
