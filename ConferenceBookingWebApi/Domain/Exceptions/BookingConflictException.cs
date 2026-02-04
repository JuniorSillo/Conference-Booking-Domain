using System;

namespace ConferenceBooking.Domain.Exceptions;

public class BookingConflictException : Exception
{
    public BookingConflictException(string message = "The requested time slot conflicts with an existing booking.") : base(message) { }
}