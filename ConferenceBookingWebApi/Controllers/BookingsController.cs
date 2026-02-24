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
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
    return Ok(new { status = "OK", timestamp = DateTime.UtcNow });
    }

    // GET: api/bookings – default list with pagination & sorting
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetAllBookings(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        return await GetFilteredBookings(null, null, null, null, null, page, pageSize, sortBy, sortOrder);
    }

    // GET: api/bookings/room/{roomId}
    [HttpGet("room/{roomId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetBookingsByRoom(
        string roomId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        return await GetFilteredBookings(roomId: roomId, page: page, pageSize: pageSize, sortBy: sortBy, sortOrder: sortOrder);
    }

    // GET: api/bookings/location/{location}
    [HttpGet("location/{location}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetBookingsByLocation(
        string location,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        return await GetFilteredBookings(location: location, page: page, pageSize: pageSize, sortBy: sortBy, sortOrder: sortOrder);
    }

    // GET: api/bookings/date-range
    [HttpGet("date-range")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetBookingsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        return await GetFilteredBookings(startDate: startDate, endDate: endDate, page: page, pageSize: pageSize, sortBy: sortBy, sortOrder: sortOrder);
    }

    // GET: api/bookings/active-rooms
    [HttpGet("active-rooms")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetBookingsActiveRoomsOnly(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",
        [FromQuery] string sortOrder = "asc")
    {
        return await GetFilteredBookings(activeRoomsOnly: true, page: page, pageSize: pageSize, sortBy: sortBy, sortOrder: sortOrder);
    }

    // Shared filtering/pagination/sorting logic
    private async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetFilteredBookings(
        string? roomId = null,
        string? location = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        bool? activeRoomsOnly = null,
        int page = 1,
        int pageSize = 10,
        string sortBy = "starttime",
        string sortOrder = "asc")
    {
        var query = _manager.GetBookingsQueryable()
            .AsNoTracking();

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

        var result = new PagedResultDto<BookingSummaryDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        return Ok(result);
    }

    // GET single booking
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Employee,Admin,Receptionist,FacilitiesManager")]
    public async Task<ActionResult<BookingDto>> GetBooking(Guid id)
    {
        var booking = await _manager.GetBookingByIdAsync(id);
        if (booking == null)
            return NotFound();

        var dto = new BookingDto
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

        return Ok(dto);
    }

    // POST create – FIXED: now passes userId from JWT token
    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var room = _seedData.SeedRooms().FirstOrDefault(r => r.RoomID == request.RoomID);
        if (room == null)
            return BadRequest(new { Message = "Room not found" });

        // Get the current logged-in user's ID from the JWT token
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User ID not found in token" });

        var domainRequest = new BookingRequest
        {
            Room = room,
            StartTime = request.StartTime,
            EndTime = request.EndTime
        };

        var booking = await _manager.CreateBookingAsync(domainRequest, userId);  // ← FIXED: added userId

        var dto = new BookingDto
        {
            Id = booking.Id,
            Room = new RoomDto
            {
                RoomID = room.RoomID,
                RoomName = room.RoomName,
                Capacity = room.Capacity,
                RoomType = room.RoomType.ToString(),
                Amenities = room.Amenities.ToString(),
                Location = room.Location,
                IsActive = room.IsActive
            },
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            Status = booking.Status.ToString(),
            CreatedAt = booking.CreatedAt,
            CancelledAt = booking.CancelledAt
        };

        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, dto);
    }

    // PUT update
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Employee")]
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

        var dto = new BookingDto
        {
            Id = updated.Id,
            Room = new RoomDto
            {
                RoomID = updated.Room.RoomID,
                RoomName = updated.Room.RoomName,
                Capacity = updated.Room.Capacity,
                RoomType = updated.Room.RoomType.ToString(),
                Amenities = updated.Room.Amenities.ToString(),
                Location = updated.Room.Location,
                IsActive = updated.Room.IsActive
            },
            StartTime = updated.StartTime,
            EndTime = updated.EndTime,
            Status = updated.Status.ToString(),
            CreatedAt = updated.CreatedAt,
            CancelledAt = updated.CancelledAt
        };

        return Ok(dto);
    }

    // POST cancel
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CancelBooking(Guid id)
    {
        bool success = await _manager.CancelBookingAsync(id);
        if (!success)
            return NotFound();

        return Ok(new { Message = "Booking cancelled successfully" });
    }

    // DELETE
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBooking(Guid id)
    {
        bool success = await _manager.DeleteBookingAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }
}