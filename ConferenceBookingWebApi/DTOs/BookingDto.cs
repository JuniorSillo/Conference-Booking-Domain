namespace ConferenceBookingWebApi.DTOs;

public class BookingDto
{
    public Guid Id { get; set; }
    public RoomDto Room { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;

    
    public DateTime CreatedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
}