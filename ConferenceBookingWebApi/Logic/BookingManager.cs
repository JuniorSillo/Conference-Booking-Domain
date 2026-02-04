using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Exceptions;
using ConferenceBooking.Data;
namespace ConferenceBooking.Logic;

public class BookingManager
{
    private readonly List<Booking> _bookings = new();

    public IReadOnlyList<Booking> GetBookings() => _bookings.AsReadOnly();

    public Booking? GetBookingById(Guid id) => _bookings.FirstOrDefault(b => b.Id == id);

    public Booking CreateBooking(BookingRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (request.StartTime >= request.EndTime)
            throw new ArgumentException("End time must be after start time.");

        bool overlaps = _bookings.Any(b =>
            b.Room.RoomID == request.Room.RoomID &&
            b.Status is BookingStatus.Approved or BookingStatus.Pending &&
            request.StartTime < b.EndTime &&
            request.EndTime > b.StartTime);

        if (overlaps)
            throw new BookingConflictException("Time slot overlaps with an existing booking.");

        var booking = Booking.Create(request.Room, request.StartTime, request.EndTime);
        booking.UpdateStatus(BookingStatus.Approved);

        _bookings.Add(booking);
        return booking;
    }

    public bool UpdateBooking(Guid id, DateTime newStart, DateTime newEnd)
    {
        var booking = GetBookingById(id);
        if (booking == null) return false;

        if (newStart >= newEnd)
            throw new ArgumentException("End time must be after start time.");

        bool overlaps = _bookings.Any(b =>
            b.Id != id &&
            b.Room.RoomID == booking.Room.RoomID &&
            b.Status is BookingStatus.Approved or BookingStatus.Pending &&
            newStart < b.EndTime &&
            newEnd > b.StartTime);

        if (overlaps)
            throw new BookingConflictException("New time slot conflicts with another booking.");

        var updated = Booking.Create(booking.Room, newStart, newEnd);
        updated.UpdateStatus(booking.Status);
        _bookings.Remove(booking);
        _bookings.Add(updated);

        return true;
    }

    public bool CancelBooking(Guid id)
    {
        var booking = GetBookingById(id);
        if (booking == null) return false;

        if (booking.Status == BookingStatus.Completed)
            throw new InvalidOperationException("Cannot cancel completed booking.");

        booking.UpdateStatus(BookingStatus.Cancelled);
        return true;
    }

    public bool DeleteBooking(Guid id)
    {
        var booking = GetBookingById(id);
        if (booking == null) return false;

        return _bookings.Remove(booking);
    }

    public IReadOnlyList<ConferenceRoom> GetAvailableRooms(DateTime start, DateTime end)
    {
        var allRooms = new SeedData().SeedRooms();

        return allRooms.Where(room =>
            !_bookings.Any(b =>
                b.Room.RoomID == room.RoomID &&
                b.Status is BookingStatus.Approved or BookingStatus.Pending &&
                start < b.EndTime &&
                end > b.StartTime)
        ).ToList().AsReadOnly();
    }
}