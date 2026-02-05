using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Exceptions;
using ConferenceBooking.Persistence;
using ConferenceBooking.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConferenceBooking.Logic;

public class BookingManager
{
    private readonly List<Booking> _bookings = new();
    private readonly BookingFileStore _store;

    public BookingManager(BookingFileStore store)
    {
        _store = store ?? throw new ArgumentNullException(nameof(store));
    }

    // Called once at startup from Program.cs
    public async Task LoadBookingsAsync()
    {
        try
        {
            var loaded = await _store.LoadAsync();

            // DIRECTLY add loaded bookings (no re-validation or CreateBooking)
            // Assume persisted data is valid/trusted
            foreach (var booking in loaded)
            {
                if (booking != null)
                {
                    _bookings.Add(booking);
                }
            }

            Console.WriteLine($"Loaded {loaded.Count} bookings from file at startup.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading bookings at startup: {ex.Message}");
        }
    }

    public IReadOnlyList<Booking> GetBookings() => _bookings.AsReadOnly();

    public Booking? GetBookingById(Guid id) => _bookings.FirstOrDefault(b => b.Id == id);

    public Booking CreateBooking(BookingRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (request.StartTime >= request.EndTime)
            throw new InvalidBookingTimeException("End time must be after start time.");

        if (request.StartTime < DateTime.Now)
            throw new InvalidBookingTimeException("Cannot book in the past.");

        bool overlaps = _bookings.Any(b =>
            b.Room.RoomID == request.Room.RoomID &&
            b.Status is BookingStatus.Pending or BookingStatus.Approved &&
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
            throw new InvalidBookingTimeException("End time must be after start time.");

        bool overlaps = _bookings.Any(b =>
            b.Id != id &&
            b.Room.RoomID == booking.Room.RoomID &&
            b.Status is BookingStatus.Pending or BookingStatus.Approved &&
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
                b.Status is BookingStatus.Pending or BookingStatus.Approved &&
                start < b.EndTime &&
                end > b.StartTime)
        ).ToList().AsReadOnly();
    }
}