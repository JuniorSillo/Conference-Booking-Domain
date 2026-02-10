using System.ComponentModel.DataAnnotations;

namespace ConferenceBooking.Domain.Models;

public record ConferenceRoom
{
    [Key]
    public string RoomID { get; init; } = string.Empty;

    public string RoomName { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public RoomType RoomType { get; init; }
    public RoomAmenity Amenities { get; init; }

    
    public string? Location { get; init; }      
    public bool IsActive { get; init; } = true; 
}