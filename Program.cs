using ConferenceBooking.Data;
using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Exceptions;
using ConferenceBooking.Logic;
using ConferenceBooking.Persistence;

var rooms = new SeedData().SeedRooms();
var manager = new BookingManager();
var store = new BookingFileStore("bookings.json");

// Optional: load existing bookings
// var existing = await store.LoadAsync();
// foreach (var b in existing) manager.CreateBooking(...); // would need mapping

try
{
    var request = new BookingRequest(
        Room: rooms[0],
        StartTime: DateTime.Now.AddHours(1),
        EndTime: DateTime.Now.AddHours(2),
        Purpose: "Team planning session"
    );

    var booking = manager.CreateBooking(request);
    Console.WriteLine("Booking created successfully!");
    Console.WriteLine(booking);

    // await store.SaveAsync(manager.GetBookings());
}
catch (BookingConflictException ex)
{
    Console.WriteLine($"Conflict: {ex.Message}");
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}

Console.WriteLine("\nPress any key to exit...");
Console.ReadKey();
