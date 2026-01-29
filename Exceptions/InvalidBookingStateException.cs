namespace ConferenceBooking.Domain.Exceptions;

public class InvalidBookingStateException : Exception
{
    public InvalidBookingStateException(string message) : base(message) { }
}