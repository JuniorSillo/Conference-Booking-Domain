using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConferenceBooking.Domain.Models;
using ConferenceBooking.Logic;
using ConferenceBooking.Data;
using ConferenceBookingWebApi.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace ConferenceBookingWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly BookingManager _manager;
    private readonly SeedData _seedData;

    public BookingsController(BookingManager manager, SeedData seedData)
    {
        _manager = manager ?? throw new ArgumentNullException(nameof(manager));
        _seedData = seedData ?? throw new ArgumentNullException(nameof(seedData));
    }

    // ── Health ────────────────────────────────────────────────────────────────
    [HttpGet("health")]
    public IActionResult HealthCheck() =>
        Ok(new { status = "OK", timestamp = DateTime.UtcNow });

    // ── GET all bookings (paginated) ──────────────────────────────────────────
    // Admin sees ALL bookings.
    // Employee, Receptionist, FacilitiesManager see only their own.
    [HttpGet]
    [Authorize(Roles = "Admin,Employee,Receptionist,FacilitiesManager")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetAllBookings(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        var userId = GetUserId();

        return await GetFilteredBookings(
            userId: null,   // all roles see all bookings
            page: page, pageSize: pageSize,
            sortBy: sortBy, sortOrder: sortOrder);
    }

    // ── GET bookings by room ──────────────────────────────────────────────────
    [HttpGet("room/{roomId}")]
    [Authorize(Roles = "Admin,Employee,Receptionist,FacilitiesManager")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetBookingsByRoom(
        string roomId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        var userId = GetUserId();

        return await GetFilteredBookings(
            roomId: roomId,
            userId: null,
            page: page, pageSize: pageSize,
            sortBy: sortBy, sortOrder: sortOrder);
    }

    // ── GET bookings by location ──────────────────────────────────────────────
    [HttpGet("location/{location}")]
    [Authorize(Roles = "Admin,Employee,Receptionist,FacilitiesManager")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetBookingsByLocation(
        string location,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        var userId = GetUserId();

        return await GetFilteredBookings(
            location: location,
            userId: null,
            page: page, pageSize: pageSize,
            sortBy: sortBy, sortOrder: sortOrder);
    }

    // ── GET bookings by date range ────────────────────────────────────────────
    [HttpGet("date-range")]
    [Authorize(Roles = "Admin,Employee,Receptionist,FacilitiesManager")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetBookingsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        var userId = GetUserId();

        return await GetFilteredBookings(
            startDate: startDate, endDate: endDate,
            userId: null,
            page: page, pageSize: pageSize,
            sortBy: sortBy, sortOrder: sortOrder);
    }

    // ── GET active rooms only ─────────────────────────────────────────────────
    [HttpGet("active-rooms")]
    [Authorize(Roles = "Admin,Employee,Receptionist,FacilitiesManager")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetBookingsActiveRoomsOnly(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        var userId = GetUserId();

        return await GetFilteredBookings(
            activeRoomsOnly: true,
            userId: null,
            page: page, pageSize: pageSize,
            sortBy: sortBy, sortOrder: sortOrder);
    }

    // ── GET single booking ────────────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Employee,Receptionist,FacilitiesManager")]
    public async Task<ActionResult<BookingDto>> GetBooking(Guid id)
    {
        var booking = await _manager.GetBookingByIdAsync(id);
        if (booking == null)
            return NotFound();

        // Non-admins can only view their own bookings
        if (!User.IsInRole("Admin") && booking.UserId != GetUserId())
            return Forbid();

        return Ok(MapToBookingDto(booking));
    }

    // ── POST create ───────────────────────────────────────────────────────────
    // Only Employee and Receptionist can create bookings
    [HttpPost]
    [Authorize(Roles = "Employee,Receptionist")]
    public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var room = _seedData.SeedRooms().FirstOrDefault(r => r.RoomID == request.RoomID);
        if (room == null)
            return BadRequest(new { Message = "Room not found" });

        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User ID not found in token" });

        var domainRequest = new BookingRequest
        {
            Room = room,
            StartTime = request.StartTime,
            EndTime = request.EndTime
        };

        var booking = await _manager.CreateBookingAsync(domainRequest, userId);
        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, MapToBookingDto(booking));
    }

    // ── PUT update ────────────────────────────────────────────────────────────
    // Only Admin and FacilitiesManager can update bookings
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,FacilitiesManager")]
    public async Task<ActionResult<BookingDto>> UpdateBooking(Guid id, [FromBody] UpdateBookingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        bool success = await _manager.UpdateBookingAsync(id, request.StartTime, request.EndTime);
        if (!success)
            return NotFound();

        var updated = await _manager.GetBookingByIdAsync(id);
        if (updated == null)
            return NotFound();

        return Ok(MapToBookingDto(updated));
    }

    // ── POST cancel ───────────────────────────────────────────────────────────
    // Only Admin and FacilitiesManager can cancel bookings
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Admin,FacilitiesManager")]
    public async Task<IActionResult> CancelBooking(Guid id)
    {
        // Verify booking exists first
        var booking = await _manager.GetBookingByIdAsync(id);
        if (booking == null)
            return NotFound();

        bool success = await _manager.CancelBookingAsync(id);
        if (!success)
            return NotFound();

        return Ok(new { Message = "Booking cancelled successfully" });
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    // Admin only
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBooking(Guid id)
    {
        bool success = await _manager.DeleteBookingAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /// <summary>Gets the current user's ID from the JWT token.</summary>
    private string? GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    /// <summary>Shared filtering, sorting, and pagination logic.</summary>
    private async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetFilteredBookings(
        string? roomId = null,
        string? location = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        bool? activeRoomsOnly = null,
        string? userId = null,       // null = no user filter (Admin sees all)
        int page = 1,
        int pageSize = 10,
        string sortBy = "starttime",
        string sortOrder = "asc")
    {
        var query = _manager.GetBookingsQueryable().AsNoTracking();

        // Filter by owner for non-admin roles
        if (!string.IsNullOrEmpty(userId))
            query = query.Where(b => b.UserId == userId);

        if (!string.IsNullOrWhiteSpace(roomId))
            query = query.Where(b => b.RoomID == roomId);

        if (!string.IsNullOrWhiteSpace(location))
            query = query.Where(b => b.Room.Location != null && b.Room.Location.Contains(location));

        if (startDate.HasValue)
            query = query.Where(b => b.StartTime >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(b => b.StartTime <= endDate.Value);

        if (activeRoomsOnly == true)
            query = query.Where(b => b.Room.IsActive);

        query = sortBy.ToLower() switch
        {
            "starttime" => sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(b => b.StartTime)
                : query.OrderBy(b => b.StartTime),
            "createdat" => sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(b => b.CreatedAt)
                : query.OrderBy(b => b.CreatedAt),
            "roomname" => sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(b => b.Room.RoomName)
                : query.OrderBy(b => b.Room.RoomName),
            _ => query.OrderBy(b => b.StartTime)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new BookingSummaryDto
            {
                Id = b.Id,
                RoomName = b.Room.RoomName,
                RoomLocation = b.Room.Location,
                RoomIsActive = b.Room.IsActive,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Status = b.Status.ToString(),
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(new PagedResultDto<BookingSummaryDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        });
    }

    /// <summary>Maps a Booking domain object to a BookingDto.</summary>
    private static BookingDto MapToBookingDto(Booking booking) => new()
    {
        Id = booking.Id,
        Room = new RoomDto
        {
            RoomID = booking.Room.RoomID,
            RoomName = booking.Room.RoomName,
            Capacity = booking.Room.Capacity,
            RoomType = booking.Room.RoomType.ToString(),
            Amenities = booking.Room.Amenities.ToString(),
            Location = booking.Room.Location,
            IsActive = booking.Room.IsActive
        },
        StartTime = booking.StartTime,
        EndTime = booking.EndTime,
        Status = booking.Status.ToString(),
        CreatedAt = booking.CreatedAt,
        CancelledAt = booking.CancelledAt
    };
}