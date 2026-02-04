namespace ConferenceBookingWebApi.DTOs.Responses;

public class ErrorResponseDto
{
    public string ErrorCode { get; set; } = "UnknownError";
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
}