namespace ConferenceBookingWebApi.DTOs.Responses;

public class BookingResponseDto
{
    public string Id { get; set; } = string.Empty;
    public RoomResponseDto Room { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class RoomResponseDto
{
    public string RoomID { get; set; } = string.Empty;
    public string RoomName { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public string Amenities { get; set; } = string.Empty;
}