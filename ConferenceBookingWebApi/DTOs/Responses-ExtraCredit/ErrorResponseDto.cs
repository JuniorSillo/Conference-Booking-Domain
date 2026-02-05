namespace ConferenceBookingWebApi.DTOs.Responses;

public class ErrorResponseDto
{
    public string ErrorCategory { get; set; } = "UnexpectedError";
    public string ErrorCode { get; set; } = "Unknown";
    public string Message { get; set; } = "An error occurred.";
    public string? Details { get; set; } 
}