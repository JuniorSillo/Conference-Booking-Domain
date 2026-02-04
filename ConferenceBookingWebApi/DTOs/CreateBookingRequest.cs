using System.ComponentModel.DataAnnotations;

namespace ConferenceBookingWebApi.DTOs;

public class CreateBookingRequest
{
    [Required(ErrorMessage = "RoomID is required")]
    public string RoomID { get; set; } = string.Empty;


    [Required(ErrorMessage = "Start time is required")]
    public DateTime StartTime { get; set; }
    

    [Required(ErrorMessage = "End time is required")]
    public DateTime EndTime { get; set; }
}