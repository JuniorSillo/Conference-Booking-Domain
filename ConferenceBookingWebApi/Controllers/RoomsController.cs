using Microsoft.AspNetCore.Mvc;
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
public class RoomsController : ControllerBase
{
    private readonly BookingManager _manager;
    private readonly SeedData _seedData;

    public RoomsController(BookingManager manager, SeedData seedData)
    {
        _manager = manager;
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
            Amenities = r.Amenities.ToString(),
            Location = r.Location,
            IsActive = r.IsActive
        });

        return Ok(dtos);
    }

    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetAvailableRooms(
        [FromQuery] DateTime start,
        [FromQuery] DateTime end)
    {
        if (start >= end)
            return BadRequest("End time must be after start time.");

        var available = await _manager.GetAvailableRoomsAsync(start, end);

        var dtos = available.Select(r => new RoomDto
        {
            RoomID = r.RoomID,
            RoomName = r.RoomName,
            Capacity = r.Capacity,
            RoomType = r.RoomType.ToString(),
            Amenities = r.Amenities.ToString(),
            Location = r.Location,
            IsActive = r.IsActive
        });

        return Ok(dtos);
    }
}