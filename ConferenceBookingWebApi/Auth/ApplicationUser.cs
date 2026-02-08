using Microsoft.AspNetCore.Identity;

namespace ConferenceBookingWebApi.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty; 
}