using System.ComponentModel.DataAnnotations;

namespace ConferenceBooking.Domain.Models;

public record Session
{
    [Key]
    public Guid Id { get; init; } = Guid.NewGuid();

    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }

    
    public int Capacity { get; init; }              
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }

    
    public string? RoomID { get; init; }
    public ConferenceRoom? Room { get; init; }
}