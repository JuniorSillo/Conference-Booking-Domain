using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConferenceBooking.Domain.Models;
using ConferenceBooking.Logic;
using ConferenceBooking.Data;
using ConferenceBookingWebApi.DTOs;
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

    public BookingsController(
        BookingManager manager,
        SeedData seedData)
    {
        _manager = manager ?? throw new ArgumentNullException(nameof(manager));
        _seedData = seedData ?? throw new ArgumentNullException(nameof(seedData));
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetAllBookings()
    {
        var bookings = await _manager.GetBookingsAsync();
        var dtos = bookings.Select(b => new BookingDto
        {
            Id = b.Id,
            Room = new RoomDto
            {
                RoomID = b.Room.RoomID,
                RoomName = b.Room.RoomName,
                Capacity = b.Room.Capacity,
                RoomType = b.Room.RoomType.ToString(),
                Amenities = b.Room.Amenities.ToString()
            },
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            Status = b.Status.ToString()
        });

        return Ok(dtos);
    }

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
                Amenities = booking.Room.Amenities.ToString()
            },
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            Status = booking.Status.ToString()
        };

        return Ok(dto);
    }

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
                Amenities = room.Amenities.ToString()
            },
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            Status = booking.Status.ToString()
        };

        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, dto);
    }

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
                Amenities = updated.Room.Amenities.ToString()
            },
            StartTime = updated.StartTime,
            EndTime = updated.EndTime,
            Status = updated.Status.ToString()
        };

        return Ok(dto);
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CancelBooking(Guid id)
    {
        bool success = await _manager.CancelBookingAsync(id);
        if (!success)
            return NotFound();

        return Ok(new { Message = "Booking cancelled successfully" });
    }

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