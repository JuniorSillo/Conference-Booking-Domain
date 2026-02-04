using System.ComponentModel.DataAnnotations;

namespace ConferenceBookingWebApi.DTOs;

public class UpdateBookingRequest
{
    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}