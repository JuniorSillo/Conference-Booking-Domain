using ConferenceBooking.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace ConferenceBooking.Domain.Services;

public class BookingService
{
    private readonly List<ConferenceRoom> _rooms = new();
    private readonly List<Booking> _bookings = new();

    public IReadOnlyList<ConferenceRoom> Rooms => _rooms.AsReadOnly();
    public IReadOnlyList<Booking> Bookings => _bookings.AsReadOnly();

    public void AddRoom(ConferenceRoom room)
    {
        if (room == null) throw new ArgumentNullException(nameof(room));
        if (_rooms.Any(r => r.Id == room.Id))
            throw new InvalidOperationException($"Room with ID {room.Id} already exists.");

        _rooms.Add(room);
    }

    public Booking? SubmitBookingRequest(
        string bookingId,
        string roomId,
        string bookedByUserId,
        DateTime startTime,
        DateTime endTime,
        int requestedCapacity,
        RoomAmenity requestedAmenities,
        string? purpose = null)
    {
        var room = _rooms.FirstOrDefault(r => r.Id == roomId);
        if (room == null)
            throw new InvalidOperationException($"Room with ID {roomId} does not exist.");

        var tentative = Booking.Create(bookingId, room, bookedByUserId, startTime, endTime, requestedCapacity, requestedAmenities, purpose);

        var hasConflict = _bookings
            .Where(b => b.Room.Id == roomId)
            .Where(b => b.Status == BookingStatus.Approved)
            .Any(b => b.OverlapsWith(startTime, endTime));

        if (hasConflict)
            throw new InvalidOperationException($"Time slot overlaps with an existing approved booking in room {room.Name}.");

        _bookings.Add(tentative);
        return tentative;
    }

    public IEnumerable<Booking> GetBookingsForRoom(string roomId)
    {
        return _bookings.Where(b => b.Room.Id == roomId);
    }

    public void SimulateBookingProgress(string bookingId)
    {
        var booking = _bookings.FirstOrDefault(b => b.Id == bookingId);
        if (booking == null)
            throw new InvalidOperationException($"Booking {bookingId} not found.");

        var statusSequence = new[]
        {
            BookingStatus.Pending,
            BookingStatus.Approved,
            BookingStatus.Completed
        };

        int currentIndex = Array.IndexOf(statusSequence, booking.Status);
        if (currentIndex == -1 || currentIndex == statusSequence.Length - 1)
        {
            Console.WriteLine($"Booking {bookingId} is already at final status: {booking.Status}. No progression needed.");
            return;
        }

        for (int i = currentIndex; i < statusSequence.Length; i++)
        {
            Console.WriteLine($"Booking {bookingId} is now: {booking.Status}. Waiting 5 seconds...");
            Thread.Sleep(5000);

            if (i < statusSequence.Length - 1)
            {
                var next = statusSequence[i + 1];
                booking.ChangeStatus(next);
                Console.WriteLine($" → Progressed to {next}");
            }
        }

        Console.WriteLine($"Booking {bookingId} has completed the status progression.");
    }
}