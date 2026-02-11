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

    // GET: api/bookings
    // Supports filtering, pagination, sorting – all at database level
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PagedResultDto<BookingSummaryDto>>> GetBookings(
        [FromQuery] string? roomId = null,
        [FromQuery] string? location = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] bool? activeRoomsOnly = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "starttime",     // starttime, createdat, roomname
        [FromQuery] string sortOrder = "asc")        // asc / desc
    {
        // Start with IQueryable – defer execution to database
        var query = _manager.GetBookingsQueryable()
            .AsNoTracking();  // performance: read-only, no change tracking

        // Filtering – all done in database
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

        // Sorting
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
            _ => query.OrderBy(b => b.StartTime)  // default
        };

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply pagination
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

    // GET single booking (unchanged from previous)
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

    // POST create (unchanged, just ensuring async)
    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var room = _seedData.SeedRooms().FirstOrDefault(r => r.RoomID == request.RoomID);
        if (room == null)
            return BadRequest(new { Message = "Room not found" });

        var domainRequest = new BookingRequest
        {
            Room = room,
            StartTime = request.StartTime,
            EndTime = request.EndTime
        };

        var booking = await _manager.CreateBookingAsync(domainRequest);

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

    // PUT update (unchanged, just async)
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

    // POST cancel (unchanged)
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CancelBooking(Guid id)
    {
        bool success = await _manager.CancelBookingAsync(id);
        if (!success)
            return NotFound();

        return Ok(new { Message = "Booking cancelled successfully" });
    }

    // DELETE (unchanged)
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