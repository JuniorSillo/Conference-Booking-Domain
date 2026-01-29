using ConferenceBooking.Domain.Models;

public class SeedData
{
    public List<ConferenceRoom> SeedRooms()
    {
      List<ConferenceRoom> ConferenceRooms = new List<ConferenceRoom>()
      {
        new ConferenceRoom ("CR001", "Ocean View", 20, "1st Floor", RoomAmenity.Projector | RoomAmenity.Whiteboard, RoomType.Premium),
      };
      return ConferenceRooms;
    }
}