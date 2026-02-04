using Microsoft.AspNetCore.Mvc;
using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Exceptions;
using ConferenceBooking.Logic;
using ConferenceBooking.Persistence;
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
    private readonly BookingFileStore _store;
    private readonly SeedData _seedData;

    public BookingsController(
        BookingManager manager,
        BookingFileStore store,
        SeedData seedData)
    {
        _manager = manager ?? throw new ArgumentNullException(nameof(manager));
        _store = store ?? throw new ArgumentNullException(nameof(store));
        _seedData = seedData ?? throw new ArgumentNullException(nameof(seedData));

        // Load persisted bookings on startup
        LoadBookingsAsync().GetAwaiter().GetResult();
    }

    private async Task LoadBookingsAsync()
    {
        try
        {
            var loaded = await _store.LoadAsync();
            foreach (var booking in loaded)
            {
                try
                {
                    _manager.CreateBooking(new BookingRequest
                    {
                        Room = booking.Room,
                        StartTime = booking.StartTime,
                        EndTime = booking.EndTime
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to reload booking {booking.Id}: {ex.Message}");
                }
            }
            Console.WriteLine($"Loaded {loaded.Count} bookings from file.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading bookings: {ex.Message}");
        }
    }

    // GET: api/bookings - List all bookings
    [HttpGet]
    public ActionResult<IEnumerable<BookingDto>> GetAllBookings()
    {
        var bookings = _manager.GetBookings();
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

    // GET: api/bookings/{id} - Get single booking by ID
    [HttpGet("{id:guid}")]
    public ActionResult<BookingDto> GetBooking(Guid id)
    {
        var booking = _manager.GetBookingById(id);
        if (booking == null)
            return NotFound(new ErrorResponse { Message = "Booking not found" });

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

    // POST: api/bookings - Create new booking
    [HttpPost]
    public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var room = _seedData.SeedRooms().FirstOrDefault(r => r.RoomID == request.RoomID);
        if (room == null)
            return BadRequest(new ErrorResponse { Message = "Room not found" });

        try
        {
            var domainRequest = new BookingRequest
            {
                Room = room,
                StartTime = request.StartTime,
                EndTime = request.EndTime
            };

            var booking = _manager.CreateBooking(domainRequest);

            await _store.SaveAsync(_manager.GetBookings());

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
        catch (BookingConflictException ex)
        {
            return Conflict(new ErrorResponse { Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected error creating booking: {ex.Message}");
            return StatusCode(500, new ErrorResponse { Message = "An unexpected error occurred" });
        }
    }

    // PUT: api/bookings/{id} - Update booking time
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BookingDto>> UpdateBooking(Guid id, [FromBody] UpdateBookingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            bool success = _manager.UpdateBooking(id, request.StartTime, request.EndTime);
            if (!success)
                return NotFound(new ErrorResponse { Message = "Booking not found" });

            await _store.SaveAsync(_manager.GetBookings());

            var updated = _manager.GetBookingById(id);
            if (updated == null)
                return NotFound(new ErrorResponse { Message = "Booking not found after update" });

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
        catch (BookingConflictException ex)
        {
            return Conflict(new ErrorResponse { Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse { Message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected error updating booking: {ex.Message}");
            return StatusCode(500, new ErrorResponse { Message = "An unexpected error occurred" });
        }
    }

    // POST: api/bookings/{id}/cancel - Cancel booking
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelBooking(Guid id)
    {
        bool success = _manager.CancelBooking(id);
        if (!success)
            return NotFound(new ErrorResponse { Message = "Booking not found or cannot be cancelled" });

        await _store.SaveAsync(_manager.GetBookings());
        return Ok(new { Message = "Booking cancelled successfully" });
    }

    // DELETE: api/bookings/{id} - Delete booking
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBooking(Guid id)
    {
        bool success = _manager.DeleteBooking(id);
        if (!success)
            return NotFound(new ErrorResponse { Message = "Booking not found" });

        await _store.SaveAsync(_manager.GetBookings());
        return NoContent();
    }
}