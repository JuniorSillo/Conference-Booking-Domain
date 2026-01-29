using ConferenceBooking.Domain.Exceptions;

static async Task Main()
{
   SeedData data = new SeedData();
   List<ConferenceRoom> rooms = data.SeedRooms(); 
   BookingManager manager = new BookingManager();
   BookingFileStore store = new BookingFileStore("bookings.json");

    try
    {
        manager.CreateBooking(new BookingRequest
        {
            Room = rooms[0],
            StartTime = DateTime.Now.AddHours(1),
            EndTime = DateTime.Now.AddHours(2)
        });

    }
    catch (BookingConflictException ex)
    {
        Console.WriteLine($"Error creating booking: {ex.Message}");
    }
}
