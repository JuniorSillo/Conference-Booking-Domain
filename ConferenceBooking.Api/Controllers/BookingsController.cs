using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Exceptions;
using ConferenceBooking.Logic;
using Microsoft.AspNetCore.Mvc;

namespace ConferenceBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly BookingManager _manager;
    private readonly BookingFileStore _store;

    public BookingsController(BookingManager manager, BookingFileStore store)
    {
        _manager = manager;
        _store = store;

        // Load existing bookings on controller
        LoadBookingsAsync().GetAwaiter().GetResult();
    }

    private async Task LoadBookingsAsync()
    {
        var loaded = await _store.LoadAsync();
        foreach (var b in loaded)
        {
            
            _manager.CreateBooking(new BookingRequest
            {
                Room = b.Room,
                StartTime = b.StartTime,
                EndTime = b.EndTime
            });
        }
    }

    // GET: api/bookings
    [HttpGet]
    public ActionResult<IReadOnlyList<Booking>> GetBookings()
    {
        return Ok(_manager.GetBookings());
    }

    // POST: api/bookings
    [HttpPost]
    public async Task<ActionResult<Booking>> CreateBooking([FromBody] BookingRequest request)
    {
        try
        {
            var booking = _manager.CreateBooking(request);
            await _store.SaveAsync(_manager.GetBookings());
            return CreatedAtAction(nameof(GetBookings), new { id = booking.Id }, booking);
        }
        catch (BookingConflictException ex)
        {
            return Conflict(new { Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred." });
        }
    }
}