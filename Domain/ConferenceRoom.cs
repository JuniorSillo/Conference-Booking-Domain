using System;
using System.Collections.Generic;
using System.Linq;

namespace ConferenceBooking.Domain.Models;

public record class ConferenceRoom
{
    public string RoomID { get; init; }               
    public string RoomName { get; private set; }      
    public int Capacity { get; private set; }     
    public RoomType RoomType { get; private set; }
    public RoomAmenity Amenities { get; private set; }
    //Name,RoomTyepe and Capacity
    // Private constructor 
    private ConferenceRoom(string roomid, string roomname, int capacity, string location, RoomAmenity amenities, RoomType roomtype = RoomType.Standard)
    {
        RoomID = roomid;
        RoomName = roomname;
        Capacity = capacity;
        RoomType = roomtype;
        // Location = location;
        Amenities = amenities;
    }

    public static ConferenceRoom Create(
        // string roomid,
        string roomname,
        int capacity,
        string location,
        RoomType roomtype = RoomType.Standard)
    {
        // if (string.IsNullOrWhiteSpace(roomid))
        //     throw new ArgumentException("Room ID cannot be empty.", nameof(roomid));

        if (string.IsNullOrWhiteSpace(roomname))
            throw new ArgumentException("Room name cannot be empty.", nameof(roomname));

        if (capacity < 1)
            throw new ArgumentException("Capacity must be at least 1 person.", nameof(capacity));

        // if (string.IsNullOrWhiteSpace(location))
        //     throw new ArgumentException("Location cannot be empty.", nameof(location));

        return new ConferenceRoom(roomid, roomname.Trim(), capacity, location.Trim(), amenities, roomtype);
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