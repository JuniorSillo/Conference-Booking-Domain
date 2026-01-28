using System;
using System.Collections.Generic;
using System.Linq;

namespace ConferenceBooking.Domain.Models;

public record class ConferenceRoom
{
    public string Id { get; init; }
    public string Name { get; private set; }
    public int Capacity { get; private set; }
    public string Location { get; private set; }
    public RoomAmenity Amenities { get; private set; }

    // New: collection of bookings for this room (makes navigation easier)
    public List<Booking> Bookings { get; } = new();

    private ConferenceRoom(string id, string name, int capacity, string location, RoomAmenity amenities)
    {
        Id = id;
        Name = name;
        Capacity = capacity;
        Location = location;
        Amenities = amenities;
    }

    public static ConferenceRoom Create(
        string id,
        string name,
        int capacity,
        string location,
        RoomAmenity amenities = RoomAmenity.None)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Room ID cannot be empty.", nameof(id));
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Room name cannot be empty.", nameof(name));
        if (capacity < 1) throw new ArgumentException("Capacity must be at least 1 person.", nameof(capacity));
        if (string.IsNullOrWhiteSpace(location)) throw new ArgumentException("Location cannot be empty.", nameof(location));

        return new ConferenceRoom(id, name.Trim(), capacity, location.Trim(), amenities);
    }

    public void UpdateName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName)) throw new ArgumentException("Name cannot be empty.");
        Name = newName.Trim();
    }

    public bool HasAmenity(RoomAmenity amenity) => (Amenities & amenity) == amenity;

    public override string ToString() =>
        $"{Name} ({Id}) – Capacity: {Capacity}, Location: {Location}, Amenities: {Amenities}";
}