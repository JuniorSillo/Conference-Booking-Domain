using System;
using System.Linq;
using Newtonsoft.Json;  // for JsonConstructor
using System.ComponentModel.DataAnnotations;

namespace ConferenceBooking.Domain.Models;

public record ConferenceRoom
{
    [Key]
    public string RoomID { get; init; } = string.Empty;
    public string RoomName { get; private set; } = string.Empty;
    public int Capacity { get; private set; }
    public RoomType RoomType { get; private set; }
    public RoomAmenity Amenities { get; private set; }

    // Single constructor – public for JSON deserialization + used by factory
    [JsonConstructor]
    public ConferenceRoom(
        string roomID,
        string roomName,
        int capacity,
        RoomType roomType,
        RoomAmenity amenities)
    {
        RoomID = roomID ?? throw new ArgumentNullException(nameof(roomID));
        RoomName = roomName ?? throw new ArgumentNullException(nameof(roomName));
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

        // Use the public constructor directly
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

    public override string ToString()
    {
        var amenityList = Amenities == RoomAmenity.None
            ? "None"
            : string.Join(", ", Enum.GetValues(typeof(RoomAmenity))
                .Cast<RoomAmenity>()
                .Where(a => a != RoomAmenity.None && HasAmenity(a))
                .Select(a => a.ToString()));

        return $"{RoomName} ({RoomID}) – Capacity: {Capacity}, Type: {RoomType}\n" +
               $"  Amenities: {amenityList}";
    }
}