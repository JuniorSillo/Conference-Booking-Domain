using ConferenceBooking.Domain.Models;

namespace ConferenceBooking.Data;

public class SeedData
{
    public List<ConferenceRoom> SeedRooms()
    {
        return new List<ConferenceRoom>
        {
            new ConferenceRoom
            {
                RoomID = "CR001",
                RoomName = "Ocean View",
                Capacity = 20,
                RoomType = RoomType.Premium,
                Amenities = RoomAmenity.Projector | RoomAmenity.VideoConference | RoomAmenity.NaturalLight | RoomAmenity.AirConditioning | RoomAmenity.CoffeeMachine,
                Location = "Bitcube HQ, Bloemfontein, Floor 5 - Ocean Wing",
                IsActive = true
            },
            new ConferenceRoom
            {
                RoomID = "CR002",
                RoomName = "Mountain Ridge",
                Capacity = 12,
                RoomType = RoomType.Standard,
                Amenities = RoomAmenity.Projector | RoomAmenity.Whiteboard | RoomAmenity.SpeakerPhone,
                Location = "Bitcube HQ, Bloemfontein, Floor 3 - Mountain Wing",
                IsActive = true
            },
            new ConferenceRoom
            {
                RoomID = "CR003",
                RoomName = "City Skyline",
                Capacity = 8,
                RoomType = RoomType.Executive,
                Amenities = RoomAmenity.VideoConference | RoomAmenity.NaturalLight | RoomAmenity.CoffeeMachine,
                Location = "Bitcube HQ, Bloemfontein, Floor 10 - Skyline Suite",
                IsActive = true
            },
            new ConferenceRoom
            {
                RoomID = "CR004",
                RoomName = "Boardroom Alpha",
                Capacity = 16,
                RoomType = RoomType.Boardroom,
                Amenities = RoomAmenity.Projector | RoomAmenity.Whiteboard | RoomAmenity.VideoConference | RoomAmenity.SpeakerPhone | RoomAmenity.AirConditioning,
                Location = "Bitcube HQ, Bloemfontein, Floor 2 - Executive Floor",
                IsActive = true
            },
            new ConferenceRoom
            {
                RoomID = "CR005",
                RoomName = "River Side",
                Capacity = 10,
                RoomType = RoomType.Standard,
                Amenities = RoomAmenity.Projector | RoomAmenity.Whiteboard,
                Location = "Bitcube HQ, Bloemfontein, Floor 4 - River Wing",
                IsActive = true
            },
            new ConferenceRoom
            {
                RoomID = "CR006",
                RoomName = "Sunset Lounge",
                Capacity = 25,
                RoomType = RoomType.Premium,
                Amenities = RoomAmenity.VideoConference | RoomAmenity.NaturalLight | RoomAmenity.CoffeeMachine | RoomAmenity.AirConditioning,
                Location = "Bitcube HQ, Bloemfontein, Floor 12 - Rooftop",
                IsActive = true
            },
            new ConferenceRoom
            {
                RoomID = "CR007",
                RoomName = "Tech Hub",
                Capacity = 15,
                RoomType = RoomType.Executive,
                Amenities = RoomAmenity.Projector | RoomAmenity.VideoConference | RoomAmenity.SpeakerPhone,
                Location = "Bitcube HQ, Bloemfontein, Floor 6 - Tech Wing",
                IsActive = true
            },
            new ConferenceRoom
            {
                RoomID = "CR008",
                RoomName = "Quiet Zone",
                Capacity = 6,
                RoomType = RoomType.Standard,
                Amenities = RoomAmenity.NaturalLight,
                Location = "Bitcube HQ, Bloemfontein, Floor 1 - Quiet Area",
                IsActive = false  // Example inactive room
            },
            new ConferenceRoom
            {
                RoomID = "CR009",
                RoomName = "Strategy Room",
                Capacity = 18,
                RoomType = RoomType.Boardroom,
                Amenities = RoomAmenity.Projector | RoomAmenity.Whiteboard | RoomAmenity.VideoConference,
                Location = "Bitcube HQ, Bloemfontein, Floor 7 - Strategy Suite",
                IsActive = true
            },
            new ConferenceRoom
            {
                RoomID = "CR010",
                RoomName = "Creative Space",
                Capacity = 14,
                RoomType = RoomType.Executive,
                Amenities = RoomAmenity.CoffeeMachine | RoomAmenity.NaturalLight | RoomAmenity.Whiteboard,
                Location = "Bitcube HQ, Bloemfontein, Floor 8 - Creative Wing",
                IsActive = true
            }
        };
    }
}