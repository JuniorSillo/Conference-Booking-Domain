using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Exceptions;

namespace ConferenceBooking.Logic;

public class BookingManager
{
    private readonly List<Booking> _bookings = new();

    public IReadOnlyList<Booking> GetBookings() => _bookings.AsReadOnly();

    public Booking CreateBooking(BookingRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (request.StartTime >= request.EndTime)
            throw new ArgumentException("End time must be after start time.");

        // Check for real overlap with active bookings
        bool overlaps = _bookings.Any(b =>
            b.Room.RoomID == request.Room.RoomID &&
            b.Status is BookingStatus.Approved or BookingStatus.Pending &&
            request.StartTime < b.EndTime &&
            request.EndTime > b.StartTime);

        if (overlaps)
            throw new BookingConflictException("Time slot overlaps with an existing booking.");

        var booking = Booking.Create(
            request.Room,
            request.StartTime,
            request.EndTime,
            request.Purpose);

        // For demo: auto-approve (in real app → would go to approval flow)
        booking.UpdateStatus(BookingStatus.Approved);

        _bookings.Add(booking);
        return booking;
    }
}
