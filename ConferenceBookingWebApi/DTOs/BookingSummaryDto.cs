namespace ConferenceBookingWebApi.DTOs;

public class BookingSummaryDto
{
    public Guid Id { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public string? RoomLocation { get; set; }
    public bool RoomIsActive { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}