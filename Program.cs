using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

class Program
{
    private static readonly BookingService _service = new BookingService();

    static async Task Main(string[] args)
    {
        Console.WriteLine("Conference Room Booking System – Assignment 1.3");
        Console.WriteLine("Loading data...\n");

        await _service.InitializeAsync();

        LoadRoomsFromList();

        Console.WriteLine("\nReady. 10 rooms are available.\n");

        while (true)
        {
            Console.WriteLine("\n=== MAIN MENU ===");
            Console.WriteLine("1. View all rooms");
            Console.WriteLine("2. Make a new booking");
            Console.WriteLine("3. Cancel an existing booking");
            Console.WriteLine("4. Simulate status progression");
            Console.WriteLine("5. View all bookings");
            Console.WriteLine("6. Exit");

            Console.Write("\nChoose option (1-6): ");
            var input = Console.ReadLine()?.Trim();

            switch (input)
            {
                case "1": ViewRooms(); break;
                case "2": await MakeBookingAsync(); break;
                case "3": await CancelBookingAsync(); break;
                case "4": SimulateProgress(); break;
                case "5": ViewBookings(); break;
                case "6": Console.WriteLine("Goodbye!"); return;
                default: Console.WriteLine("Invalid choice."); break;
            }
        }
    }

    static void LoadRoomsFromList()
    {
        var rooms = new List<(string Id, string Name, int Capacity, string Location, RoomAmenity Amenities)>
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

        foreach (var (id, name, capacity, location, amenities) in rooms)
        {
            try
            {
                var room = ConferenceRoom.Create(id, name, capacity, location, amenities);
                _service.AddRoom(room);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Failed to add room {id}: {ex.Message}");
            }
        }

        Console.WriteLine($"Loaded {rooms.Count} rooms from list.");
    }

    static void ViewRooms()
    {
        Console.WriteLine("\nAvailable Rooms:");
        foreach (var r in _service.Rooms)
        {
            Console.WriteLine($"  {r.Id} - {r.Name} (Cap: {r.Capacity}, Loc: {r.Location}, Amenities: {r.Amenities})");
        }
    }

    static async Task MakeBookingAsync()
    {
        ViewRooms();

        Console.Write("\nYour name: ");
        var userName = Console.ReadLine()?.Trim();
        if (string.IsNullOrWhiteSpace(userName)) { Console.WriteLine("Name required."); return; }

        Console.Write("Booking ID (leave blank to auto-generate): ");
        var bookingIdInput = Console.ReadLine()?.Trim();

        Console.Write("Room ID (choose from above): ");
        var roomId = Console.ReadLine()?.Trim();

        Console.Write("Number of people needed: ");
        if (!int.TryParse(Console.ReadLine(), out int reqCapacity) || reqCapacity < 1) { Console.WriteLine("Invalid capacity."); return; }

        RoomAmenity reqAmenities = RoomAmenity.None;
        Console.WriteLine("Required amenities (comma-separated numbers or blank): 1=Projector 2=Whiteboard 3=VideoConference 4=SpeakerPhone 5=NaturalLight");
        var amenStr = Console.ReadLine()?.Trim();
        if (!string.IsNullOrEmpty(amenStr))
        {
            foreach (var p in amenStr.Split(','))
                if (int.TryParse(p.Trim(), out int num) && num >= 1 && num <= 5)
                    reqAmenities |= (RoomAmenity)(1 << (num - 1));
        }

        Console.Write("Date (YYYY-MM-DD): ");
        if (!DateTime.TryParse(Console.ReadLine(), out DateTime baseDate)) { Console.WriteLine("Invalid date."); return; }

        Console.Write("Start time (HH:MM): ");
        if (!TimeSpan.TryParse(Console.ReadLine(), out TimeSpan startTs)) { Console.WriteLine("Invalid time."); return; }

        Console.Write("End time (HH:MM): ");
        if (!TimeSpan.TryParse(Console.ReadLine(), out TimeSpan endTs)) { Console.WriteLine("Invalid time."); return; }

        var start = baseDate.Date + startTs;
        var end = baseDate.Date + endTs;

        if (start >= end) { Console.WriteLine("Start must be before end."); return; }

        Console.Write("Purpose (optional): ");
        var purpose = Console.ReadLine()?.Trim();

        // FINAL STRICT CHECK: reload file and block if conflict
        Console.WriteLine("\nChecking latest availability from file...");
        bool isFree = await _service.IsSlotAvailableAsync(roomId, start.ToUniversalTime(), end.ToUniversalTime());

        if (!isFree)
        {
            Console.WriteLine("\nCannot book - there is already a meeting at that time in this room.");
            return;
        }

        Console.WriteLine("Slot is free - proceeding...");

        try
        {
            var booking = await _service.SubmitBookingRequestAsync(
                bookingIdInput, roomId, userName, start.ToUniversalTime(), end.ToUniversalTime(),
                reqCapacity, reqAmenities, purpose);

            // Prominently show the ID
            Console.WriteLine("\n╔════════════════════════════════════════════╗");
            Console.WriteLine("║        BOOKING CREATED SUCCESSFULLY        ║");
            Console.WriteLine($"║ Your Booking ID: {booking.Id,-30} ║");
            Console.WriteLine("╚════════════════════════════════════════════╝");
            Console.WriteLine($"Full details: {booking}");

            Console.Write("\nSimulate status progression now? (y/n): ");
            if (Console.ReadLine()?.Trim().ToLower() == "y")
            {
                _service.SimulateBookingProgress(booking.Id);
                Console.WriteLine($"\nReminder: Your Booking ID is {booking.Id} (save this for cancel/simulate).");
            }
        }
        catch (BookingConflictException bcex)
        {
            Console.WriteLine($"\nConflict detected: {bcex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\nError: {ex.Message}");
        }
    }

    static async Task CancelBookingAsync()
    {
        if (!_service.Bookings.Any())
        {
            Console.WriteLine("No bookings to cancel.");
            return;
        }

        Console.WriteLine("\nCurrent Bookings (copy the ID to cancel):");
        foreach (var b in _service.Bookings)
        {
            Console.WriteLine($"ID: {b.Id} | {b}");
        }

        Console.Write("\nEnter Booking ID to cancel: ");
        var id = Console.ReadLine()?.Trim();

        if (string.IsNullOrWhiteSpace(id))
        {
            Console.WriteLine("ID required.");
            return;
        }

        try
        {
            await _service.CancelBookingAsync(id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Cancel failed: {ex.Message}");
        }
    }

    static void SimulateProgress()
    {
        if (!_service.Bookings.Any())
        {
            Console.WriteLine("No bookings available.");
            return;
        }

        Console.WriteLine("\nCurrent Bookings:");
        foreach (var b in _service.Bookings)
            Console.WriteLine($"ID: {b.Id} | {b}");

        Console.Write("\nEnter Booking ID to simulate: ");
        var id = Console.ReadLine()?.Trim();

        try
        {
            _service.SimulateBookingProgress(id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Simulation failed: {ex.Message}");
        }
    }

    static void ViewBookings()
    {
        Console.WriteLine("\nCurrent Bookings:");
        if (!_service.Bookings.Any())
        {
            Console.WriteLine("  (No bookings yet)");
            return;
        }

        foreach (var b in _service.Bookings)
        {
            Console.WriteLine($"ID: {b.Id} | {b}");
        }
    }
}