namespace ConferenceBooking.Domain.Exceptions;

public class RoomNotFoundException : Exception
{
    public RoomNotFoundException(string message = "Room not found.") 
        : base(message) { }
}