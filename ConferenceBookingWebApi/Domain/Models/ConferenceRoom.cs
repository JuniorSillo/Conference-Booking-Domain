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

    // Changed from init to set so we can change it in SoftDelete/Restore
    public bool IsActive { get; set; } = true;

    public DateTime? DeletedAt { get; private set; }

    public void SoftDelete()
    {
        IsActive = false;
        DeletedAt = DateTime.UtcNow;
    }

    public void Restore()
    {
        IsActive = true;
        DeletedAt = null;
    }
}