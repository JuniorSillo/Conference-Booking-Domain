using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ConferenceBooking.Domain.Services;

public class BookingService
{
    private readonly List<ConferenceRoom> _rooms = new();
    private readonly List<Booking> _bookings = new();
    private const string BookingsFilePath = "bookings.json";

    public IReadOnlyList<ConferenceRoom> Rooms => _rooms.AsReadOnly();
    public IReadOnlyList<Booking> Bookings => _bookings.AsReadOnly();

    public async Task InitializeAsync()
    {
        await LoadBookingsAsync();
    }

    public void AddRoom(ConferenceRoom room)
    {
        ArgumentNullException.ThrowIfNull(room);

        if (_rooms.Any(r => r.Id == room.Id))
            throw new InvalidOperationException($"Room with ID {room.Id} already exists.");

        _rooms.Add(room);
    }

    public async Task<Booking> SubmitBookingRequestAsync(
        string? bookingId,
        string roomId,
        string bookedByUserId,
        DateTime startTime,
        DateTime endTime,
        int requestedCapacity,
        RoomAmenity requestedAmenities,
        string? purpose = null)
    {
        ArgumentNullException.ThrowIfNullOrWhiteSpace(roomId);
        ArgumentNullException.ThrowIfNullOrWhiteSpace(bookedByUserId);

        var room = _rooms.FirstOrDefault(r => r.Id == roomId)
            ?? throw new InvalidOperationException($"Room with ID {roomId} does not exist.");

        bookingId ??= $"BOOK-{Guid.NewGuid():N}".Substring(0, 16).ToUpper();

        var tentative = Booking.Create(
            bookingId,
            room,
            bookedByUserId,
            startTime,
            endTime,
            requestedCapacity,
            requestedAmenities,
            purpose);

        // Strict final check: reload file
        await LoadBookingsAsync();

        var conflictExists = _bookings
            .Where(b => b.Room.Id == roomId)
            .Where(b => b.Status != BookingStatus.Cancelled)
            .Any(b => b.OverlapsWith(startTime, endTime));

        if (conflictExists)
            throw new BookingConflictException($"Cannot book - there is already a meeting at that time in {room.Name}.");

        _bookings.Add(tentative);
        await SaveBookingsAsync();

        return tentative;
    }

    public async Task<bool> IsSlotAvailableAsync(string roomId, DateTime startTime, DateTime endTime)
    {
        await LoadBookingsAsync(); // Refresh from file

        if (string.IsNullOrWhiteSpace(roomId)) return false;

        var conflict = _bookings
            .Where(b => b.Room.Id == roomId)
            .Where(b => b.Status != BookingStatus.Cancelled)
            .Any(b => b.OverlapsWith(startTime, endTime));

        return !conflict;
    }

    public async Task CancelBookingAsync(string bookingId)
    {
        ArgumentNullException.ThrowIfNullOrWhiteSpace(bookingId);

        var booking = _bookings.FirstOrDefault(b => b.Id == bookingId)
            ?? throw new InvalidOperationException($"Booking {bookingId} not found.");

        if (booking.Status == BookingStatus.Completed)
            throw new InvalidBookingStateException("Cannot cancel a completed booking.");

        if (booking.Status == BookingStatus.Cancelled)
            throw new InvalidBookingStateException("Booking is already cancelled.");

        booking.ChangeStatus(BookingStatus.Cancelled);
        await SaveBookingsAsync();

        Console.WriteLine($"Booking {bookingId} cancelled.");
    }

    private async Task SaveBookingsAsync()
    {
        try
        {
            var json = JsonSerializer.Serialize(_bookings, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(BookingsFilePath, json);
            Console.WriteLine("Bookings saved to file.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Save failed: {ex.Message}");
        }
    }

    private async Task LoadBookingsAsync()
    {
        if (!File.Exists(BookingsFilePath)) return;

        try
        {
            var json = await File.ReadAllTextAsync(BookingsFilePath);
            var loaded = JsonSerializer.Deserialize<List<Booking>>(json);
            if (loaded != null)
            {
                _bookings.Clear();
                _bookings.AddRange(loaded);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Load failed: {ex.Message}");
        }
    }

    public void SimulateBookingProgress(string bookingId)
    {
        ArgumentNullException.ThrowIfNullOrWhiteSpace(bookingId);

        var booking = _bookings.FirstOrDefault(b => b.Id == bookingId)
            ?? throw new InvalidOperationException($"Booking {bookingId} not found.");

        var sequence = new[] { BookingStatus.Pending, BookingStatus.Approved, BookingStatus.Completed };

        int idx = Array.IndexOf(sequence, booking.Status);
        if (idx == -1 || idx >= sequence.Length - 1)
        {
            Console.WriteLine($"Booking {bookingId} already at {booking.Status}.");
            return;
        }

        Console.WriteLine($"Simulating {bookingId} from {booking.Status}...");
        for (int i = idx; i < sequence.Length; i++)
        {
            Console.WriteLine($"  Current: {booking.Status}");
            if (i < sequence.Length - 1)
            {
                Console.WriteLine("  Waiting 5s...");
                Thread.Sleep(5000);
                booking.ChangeStatus(sequence[i + 1]);
                Console.WriteLine($"  → {sequence[i + 1]}");
            }
        }
        Console.WriteLine("Done.");
    }
}