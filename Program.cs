using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Services;
using System;
using System.Linq;

class Program
{
    private static readonly BookingService _service = new BookingService();

    static void Main()
    {
        Console.WriteLine("Welcome to Conference Booking System Demo");
        Console.WriteLine("10 pre-defined rooms are loaded. You can choose one by ID.\n");

        LoadPreDefinedRooms();

        while (true)
        {
            Console.WriteLine("\n=== MENU ===");
            Console.WriteLine("1. View all available rooms");
            Console.WriteLine("2. Make a new booking (input your name, capacity needed, amenities required)");
            Console.WriteLine("3. View all bookings");
            Console.WriteLine("4. Exit");
            Console.Write("Choose option (1-4): ");

            var choice = Console.ReadLine()?.Trim();

            switch (choice)
            {
                case "1":
                    ViewRooms();
                    break;
                case "2":
                    MakeBooking();
                    break;
                case "3":
                    ViewBookings();
                    break;
                case "4":
                    Console.WriteLine("Goodbye!");
                    return;
                default:
                    Console.WriteLine("Invalid choice. Try 1-4.");
                    break;
            }
        }
    }

    static void LoadPreDefinedRooms()
    {
        var predefined = new[]
        {
            ("R101", "Executive Boardroom", 12, "Bitcube HQ, Floor 4", RoomAmenity.Projector | RoomAmenity.VideoConference | RoomAmenity.NaturalLight),
            ("R102", "Meeting Room 1", 8, "Bitcube HQ, Floor 3", RoomAmenity.Whiteboard | RoomAmenity.SpeakerPhone),
            ("R103", "Training Lab A", 20, "Bitcube HQ, Floor 2", RoomAmenity.Projector | RoomAmenity.Whiteboard | RoomAmenity.NaturalLight),
            ("R104", "Creative Studio", 6, "Bitcube HQ, Floor 5", RoomAmenity.NaturalLight),
            ("R105", "Auditorium", 50, "Bitcube HQ, Ground Floor", RoomAmenity.Projector | RoomAmenity.VideoConference | RoomAmenity.SpeakerPhone),
            ("R106", "Huddle Room", 4, "Bitcube HQ, Floor 4", RoomAmenity.Whiteboard),
            ("R107", "Collaboration Space", 15, "Bitcube HQ, Floor 3 Open", RoomAmenity.Projector | RoomAmenity.NaturalLight),
            ("R108", "Boardroom B", 10, "Bitcube HQ, Floor 4", RoomAmenity.VideoConference | RoomAmenity.SpeakerPhone),
            ("R109", "Workshop Room", 25, "Bitcube HQ, Floor 1", RoomAmenity.Whiteboard | RoomAmenity.Projector),
            ("R110", "Quiet Room", 2, "Bitcube HQ, Floor 5 Quiet Zone", RoomAmenity.None)
        };

        foreach (var (id, name, cap, loc, amen) in predefined)
        {
            try
            {
                var room = ConferenceRoom.Create(id, name, cap, loc, amen);
                _service.AddRoom(room);
            }
            catch { }
        }

        Console.WriteLine($"Loaded {predefined.Length} pre-defined rooms.");
    }

    static void ViewRooms()
    {
        Console.WriteLine("\nAvailable Rooms:");
        foreach (var r in _service.Rooms)
        {
            Console.WriteLine($"  ID: {r.Id} | {r.Name} | Cap: {r.Capacity} | Loc: {r.Location} | Amenities: {r.Amenities}");
        }
    }

    static void MakeBooking()
    {
        ViewRooms();

        Console.Write("\nEnter your name: ");
        var userName = Console.ReadLine()?.Trim();
        if (string.IsNullOrWhiteSpace(userName))
        {
            Console.WriteLine("Name is required.");
            return;
        }

        Console.Write("Enter booking ID (e.g. BOOK-001): ");
        var bookingId = Console.ReadLine()?.Trim();

        Console.Write("Enter room ID to book (from list above): ");
        var roomId = Console.ReadLine()?.Trim();

        Console.Write("How many people (capacity needed): ");
        if (!int.TryParse(Console.ReadLine(), out int reqCapacity) || reqCapacity < 1)
        {
            Console.WriteLine("Invalid capacity.");
            return;
        }

        RoomAmenity reqAmenities = RoomAmenity.None;
        Console.WriteLine("Select required amenities (numbers separated by comma, or press Enter for none):");
        Console.WriteLine("  1 = Projector    2 = Whiteboard    3 = VideoConference    4 = SpeakerPhone    5 = NaturalLight");
        var amenInput = Console.ReadLine()?.Trim();
        if (!string.IsNullOrEmpty(amenInput))
        {
            var parts = amenInput.Split(',', StringSplitOptions.RemoveEmptyEntries);
            foreach (var p in parts)
            {
                if (int.TryParse(p.Trim(), out int num) && num >= 1 && num <= 5)
                {
                    reqAmenities |= (RoomAmenity)(1 << (num - 1));
                }
            }
        }

        Console.Write("Start time (YYYY-MM-DD HH:MM): ");
        if (!DateTime.TryParse(Console.ReadLine(), out DateTime start))
        {
            Console.WriteLine("Invalid start time.");
            return;
        }

        Console.Write("End time (YYYY-MM-DD HH:MM): ");
        if (!DateTime.TryParse(Console.ReadLine(), out DateTime end))
        {
            Console.WriteLine("Invalid end time.");
            return;
        }

        Console.Write("Purpose (optional): ");
        var purpose = Console.ReadLine()?.Trim();

        try
        {
            var booking = _service.SubmitBookingRequest(
                bookingId ?? "AUTO-" + Guid.NewGuid().ToString("N").Substring(0, 8),
                roomId, userName, start.ToUniversalTime(), end.ToUniversalTime(),
                reqCapacity, reqAmenities, purpose);

            Console.WriteLine("\nBooking SUCCESSFULLY created:");
            Console.WriteLine($"  {booking}");

            Console.Write("\nSimulate status progress now? (y/n): ");
            if (Console.ReadLine()?.Trim().ToLower() == "y")
            {
                _service.SimulateBookingProgress(booking.Id);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("\nBooking FAILED:");
            Console.WriteLine($"  {ex.Message}");
        }
    }

    

    static void ViewBookings()
    {
        if (!_service.Bookings.Any())
        {
            Console.WriteLine("No bookings yet.");
            return;
        }

        Console.WriteLine("\nAll Bookings:");
        foreach (var b in _service.Bookings)
        {
            Console.WriteLine($"  {b}");
        }
    }
}