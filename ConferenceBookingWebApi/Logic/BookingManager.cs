using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Exceptions;
using ConferenceBookingWebApi.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ConferenceBooking.Data;
using ConferenceBookingWebApi.Hubs;
using Microsoft.AspNetCore.SignalR;  
using Microsoft.Extensions.DependencyInjection;


namespace ConferenceBooking.Logic;

public class BookingManager
{
    private readonly ApplicationDbContext _context;

    public BookingManager(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task LoadBookingsAsync()
    {
        var count = await _context.Bookings.CountAsync();
        Console.WriteLine($"Database initialized – {count} bookings available.");
    }

    public async Task<IReadOnlyList<Booking>> GetBookingsAsync()
    {
        return await _context.Bookings
            .Include(b => b.Room)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Booking?> GetBookingByIdAsync(Guid id)
    {
        return await _context.Bookings
            .Include(b => b.Room)
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Booking> CreateBookingAsync(BookingRequest request, string userId)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (string.IsNullOrEmpty(userId)) throw new ArgumentNullException(nameof(userId));

        // Validate room exists and is active
        var room = await _context.Rooms
            .FirstOrDefaultAsync(r => r.RoomID == request.Room.RoomID);

        if (room == null)
            throw new InvalidOperationException("Room not found.");

        if (!room.IsActive || room.DeletedAt.HasValue)
            throw new InvalidOperationException("Cannot book an inactive or deleted room.");

        if (request.StartTime >= request.EndTime)
            throw new InvalidBookingTimeException("End time must be after start time.");

        if (request.StartTime < DateTime.Now)
            throw new InvalidBookingTimeException("Cannot book in the past.");

        bool overlaps = await _context.Bookings.AnyAsync(b =>
            b.RoomID == room.RoomID &&
            (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Approved) &&
            request.StartTime < b.EndTime &&
            request.EndTime > b.StartTime);

        if (overlaps)
            throw new BookingConflictException("Time slot overlaps with an existing booking.");

        var booking = Booking.Create(room, userId, request.StartTime, request.EndTime);
        booking.UpdateStatus(BookingStatus.Approved);

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        var hubContext = _serviceProvider.GetRequiredService<IHubContext<BookingHub>>();
await hubContext.Clients.Group("BookingsGroup").SendAsync("ReceiveBookingUpdate", "A booking was updated!");

        return booking;
    }

    public async Task<bool> UpdateBookingAsync(Guid id, DateTime newStart, DateTime newEnd)
    {
        var booking = await GetBookingByIdAsync(id);
        if (booking == null) return false;

        if (newStart >= newEnd)
            throw new InvalidBookingTimeException("End time must be after start time.");

        bool overlaps = await _context.Bookings.AnyAsync(b =>
            b.Id != id &&
            b.RoomID == booking.RoomID &&
            (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Approved) &&
            newStart < b.EndTime &&
            newEnd > b.StartTime);

        if (overlaps)
            throw new BookingConflictException("New time slot conflicts with another booking.");

        var updated = Booking.Create(booking.Room, booking.UserId, newStart, newEnd);
        updated.UpdateStatus(booking.Status);

        _context.Bookings.Remove(booking);
        _context.Bookings.Add(updated);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> CancelBookingAsync(Guid id)
    {
        var booking = await GetBookingByIdAsync(id);
        if (booking == null) return false;

        if (booking.Status == BookingStatus.Completed)
            throw new InvalidOperationException("Cannot cancel completed booking.");

        booking.UpdateStatus(BookingStatus.Cancelled);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteBookingAsync(Guid id)
    {
        var booking = await GetBookingByIdAsync(id);
        if (booking == null) return false;

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IReadOnlyList<ConferenceRoom>> GetAvailableRoomsAsync(DateTime start, DateTime end)
    {
        var bookedRoomIds = await _context.Bookings
            .Where(b => (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Approved) &&
                        start < b.EndTime &&
                        end > b.StartTime)
            .Select(b => b.RoomID)
            .Distinct()
            .ToListAsync();

        var allRooms = new SeedData().SeedRooms();

        return allRooms
            .Where(r => !bookedRoomIds.Contains(r.RoomID) && r.IsActive && r.DeletedAt == null)
            .ToList()
            .AsReadOnly();
    }

    public IQueryable<Booking> GetBookingsQueryable()
    {
        return _context.Bookings
            .Include(b => b.Room)
            .AsNoTracking();
    }
}