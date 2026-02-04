namespace ConferenceBooking.Domain.Models;

public record BookingRequest
{
    public ConferenceRoom Room { get; init; } = null!;
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
}