namespace ConferenceBooking.Domain.Exceptions;

public class InvalidBookingTimeException : Exception
{
    public InvalidBookingTimeException(string message = "Invalid booking time range.") 
        : base(message) { }
}