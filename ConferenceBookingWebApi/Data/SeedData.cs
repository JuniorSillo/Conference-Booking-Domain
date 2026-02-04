using ConferenceBooking.Domain.Models;

namespace ConferenceBooking.Data;

public class SeedData
{
    public List<ConferenceRoom> SeedRooms()
    {
        return new List<ConferenceRoom>
        {
            ConferenceRoom.Create("CR001", "Ocean View", 20, RoomType.Premium, RoomAmenity.Projector | RoomAmenity.VideoConference | RoomAmenity.NaturalLight | RoomAmenity.AirConditioning | RoomAmenity.CoffeeMachine),
            ConferenceRoom.Create("CR002", "Mountain Ridge", 12, RoomType.Standard, RoomAmenity.Projector | RoomAmenity.Whiteboard | RoomAmenity.SpeakerPhone),
            ConferenceRoom.Create("CR003", "City Skyline", 8, RoomType.Executive, RoomAmenity.VideoConference | RoomAmenity.NaturalLight | RoomAmenity.CoffeeMachine),
            ConferenceRoom.Create("CR004", "Boardroom Alpha", 16, RoomType.Boardroom, RoomAmenity.Projector | RoomAmenity.Whiteboard | RoomAmenity.VideoConference | RoomAmenity.SpeakerPhone | RoomAmenity.AirConditioning),
            ConferenceRoom.Create("CR005", "River Side", 10, RoomType.Standard, RoomAmenity.Projector | RoomAmenity.Whiteboard),
            ConferenceRoom.Create("CR006", "Sunset Lounge", 25, RoomType.Premium, RoomAmenity.VideoConference | RoomAmenity.NaturalLight | RoomAmenity.CoffeeMachine | RoomAmenity.AirConditioning),
            ConferenceRoom.Create("CR007", "Tech Hub", 15, RoomType.Executive, RoomAmenity.Projector | RoomAmenity.VideoConference | RoomAmenity.SpeakerPhone),
            ConferenceRoom.Create("CR008", "Quiet Zone", 6, RoomType.Standard, RoomAmenity.NaturalLight),
            ConferenceRoom.Create("CR009", "Strategy Room", 18, RoomType.Boardroom, RoomAmenity.Projector | RoomAmenity.Whiteboard | RoomAmenity.VideoConference),
            ConferenceRoom.Create("CR010", "Creative Space", 14, RoomType.Executive, RoomAmenity.CoffeeMachine | RoomAmenity.NaturalLight | RoomAmenity.Whiteboard)
        };
    }
}