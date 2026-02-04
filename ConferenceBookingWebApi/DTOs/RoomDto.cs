namespace ConferenceBookingWebApi.DTOs;

public class RoomDto
{
     public string RoomID { get; set; } = string.Empty;
     public string RoomName { get; set; } = string.Empty;
     public int Capacity { get; set; }
     public string RoomType { get; set; } = string.Empty;
     public string Amenities { get; set; } = string.Empty;
}