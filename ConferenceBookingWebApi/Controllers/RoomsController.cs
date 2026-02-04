using Microsoft.AspNetCore.Mvc;
using ConferenceBooking.Data;
using ConferenceBooking.Logic;
using ConferenceBookingWebApi.DTOs;

namespace ConferenceBookingWebApi.Controllers;
 
[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly SeedData _seedData;

    public RoomsController(SeedData seedData)
    {
        _seedData = seedData;
    }

    [HttpGet]
    public ActionResult<IEnumerable<RoomDto>> GetAllRooms()
    {
        var rooms = _seedData.SeedRooms();
        var dtos = rooms.Select(r => new RoomDto
        {
            RoomID = r.RoomID,
            RoomName = r.RoomName,
            Capacity = r.Capacity,
            RoomType = r.RoomType.ToString(),
            Amenities = r.Amenities.ToString()
        });

        return Ok(dtos);
    }

    [HttpGet("available")]
    public ActionResult<IEnumerable<RoomDto>> GetAvailableRooms(
        [FromQuery] DateTime start,
        [FromQuery] DateTime end)
    {
        if (start >= end)
            return BadRequest(new ErrorResponse { Message = "End time must be after start time." });

        var manager = HttpContext.RequestServices.GetRequiredService<BookingManager>();
        var available = manager.GetAvailableRooms(start, end);

        var dtos = available.Select(r => new RoomDto
        {
            RoomID = r.RoomID,
            RoomName = r.RoomName,
            Capacity = r.Capacity,
            RoomType = r.RoomType.ToString(),
            Amenities = r.Amenities.ToString()
        });

        return Ok(dtos);
    }
}