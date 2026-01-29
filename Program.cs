using ConferenceBooking.Domain.Models;
using ConferenceBooking.Domain.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

class Program
{
    private static readonly BookingService _service = new BookingService();

    static async Task Main()
    {
        Console.WriteLine("Conference Booking System – Assignment 1.3");
        await _service.InitializeAsync();
        LoadRoomsFromList();
        Console.WriteLine("\nReady.\n");

        while (true)
        {
            Console.WriteLine("\n=== MENU ===");
            Console.WriteLine("1. View rooms");
            Console.WriteLine("2. Make booking");
            Console.WriteLine("3. Cancel booking");
            Console.WriteLine("4. Simulate progress");
            Console.WriteLine("5. View bookings");
            Console.WriteLine("6. Exit");

            Console.Write("Choose: ");
            var choice = Console.ReadLine()?.Trim();

            switch (choice)
            {
                case "1": ViewRooms(); break;
                case "2": await MakeBookingAsync(); break;
                case "3": await CancelBookingAsync(); break;
                case "4": SimulateProgress(); break;
                case "5": ViewBookings(); break;
                case "6": return;
                default: Console.WriteLine("Invalid."); break;
            }
        }
    }

    static void LoadRoomsFromList()
    {
        var rooms = new List<(string Id, string Name, int Capacity, string Location, RoomAmenity Amenities)>
        {
            ("R101", "Executive Boardroom", 12, "Floor 4 North Wing", RoomAmenity.Projector | RoomAmenity.VideoConference | RoomAmenity.NaturalLight),
            ("R102", "Meeting Room 1", 8, "Floor 3 East Wing", RoomAmenity.Whiteboard | RoomAmenity.SpeakerPhone),
            ("R103", "Training Lab A", 20, "Floor 2 Central", RoomAmenity.Projector | RoomAmenity.Whiteboard | RoomAmenity.NaturalLight),
            ("R104", "Creative Studio", 6, "Floor 5 South Wing", RoomAmenity.NaturalLight),
            ("R105", "Auditorium", 50, "Ground Floor", RoomAmenity.Projector | RoomAmenity.VideoConference | RoomAmenity.SpeakerPhone),
            ("R106", "Small Huddle Room", 4, "Floor 4 West Wing", RoomAmenity.Whiteboard),
            ("R107", "Collaboration Space", 15, "Floor 3 Open Area", RoomAmenity.Projector | RoomAmenity.NaturalLight),
            ("R108", "Boardroom B", 10, "Floor 4 North Wing", RoomAmenity.VideoConference | RoomAmenity.SpeakerPhone),
            ("R109", "Workshop Room", 25, "Floor 1 East", RoomAmenity.Whiteboard | RoomAmenity.Projector),
            ("R110", "Quiet Focus Room", 2, "Floor 5 Quiet Zone", RoomAmenity.None)
        };

        foreach (var r in rooms)
        {
            var room = ConferenceRoom.Create(r.Id, r.Name, r.Capacity, r.Location, r.Amenities);
            _service.AddRoom(room);
        }

        Console.WriteLine($"Loaded {rooms.Count} rooms.");
    }

    static void ViewRooms()
    {
        Console.WriteLine("\nRooms:");
        foreach (var r in _service.Rooms)
            Console.WriteLine($"  {r.Id} - {r.Name} (Cap: {r.Capacity})");
    }

    static async Task MakeBookingAsync()
    {
        ViewRooms();

        Console.Write("\nName: ");
        var name = Console.ReadLine()?.Trim() ?? "Anonymous";

        Console.Write("Booking ID (blank = auto): ");
        var idInput = Console.ReadLine()?.Trim();

        Console.Write("Room ID: ");
        var roomId = Console.ReadLine()?.Trim() ?? "";

        Console.Write("People needed: ");
        if (!int.TryParse(Console.ReadLine(), out int cap) || cap < 1) { Console.WriteLine("Invalid cap."); return; }

        RoomAmenity am = RoomAmenity.None;
        Console.WriteLine("Amenities (numbers, comma, blank): 1=Proj 2=Wht 3=VC 4=Spk 5=Lgt");
        var amStr = Console.ReadLine()?.Trim();
        if (!string.IsNullOrEmpty(amStr))
        {
            foreach (var p in amStr.Split(','))
                if (int.TryParse(p.Trim(), out int n) && n >= 1 && n <= 5)
                    am |= (RoomAmenity)(1 << (n - 1));
        }

        Console.Write("Date (YYYY-MM-DD): ");
        if (!DateTime.TryParse(Console.ReadLine(), out DateTime date)) { Console.WriteLine("Invalid date."); return; }

        Console.Write("Start (HH:MM): ");
        if (!TimeSpan.TryParse(Console.ReadLine(), out TimeSpan sTs)) { Console.WriteLine("Invalid time."); return; }

        Console.Write("End (HH:MM): ");
        if (!TimeSpan.TryParse(Console.ReadLine(), out TimeSpan eTs)) { Console.WriteLine("Invalid time."); return; }

        var start = date.Date + sTs;
        var end = date.Date + eTs;

        if (start >= end) { Console.WriteLine("Start before end."); return; }

        Console.Write("Purpose: ");
        var purpose = Console.ReadLine()?.Trim();

        // Final check
        bool free = await _service.IsSlotAvailableAsync(roomId, start.ToUniversalTime(), end.ToUniversalTime());
        if (!free)
        {
            Console.WriteLine("\nCannot book - meeting already scheduled at that time.");
            return;
        }

        try
        {
            var b = await _service.SubmitBookingRequestAsync(idInput, roomId, name, start.ToUniversalTime(), end.ToUniversalTime(), cap, am, purpose);

            Console.WriteLine("\n╔════════════════════════════╗");
            Console.WriteLine("║ BOOKING SUCCESSFUL         ║");
            Console.WriteLine($"║ ID: {b.Id} ║");
            Console.WriteLine("╚════════════════════════════╝");
            Console.WriteLine(b);

            Console.Write("Simulate progress? (y/n): ");
            if (Console.ReadLine()?.Trim().ToLower() == "y")
                _service.SimulateBookingProgress(b.Id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\nError: {ex.Message}");
        }
    }

    static async Task CancelBookingAsync()
    {
        if (!_service.Bookings.Any()) { Console.WriteLine("No bookings."); return; }

        Console.WriteLine("\nBookings:");
        foreach (var b in _service.Bookings)
            Console.WriteLine($"ID: {b.Id} | {b}");

        Console.Write("ID to cancel: ");
        var id = Console.ReadLine()?.Trim();

        if (string.IsNullOrWhiteSpace(id)) { Console.WriteLine("ID required."); return; }

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
        if (!_service.Bookings.Any()) { Console.WriteLine("No bookings."); return; }

        Console.WriteLine("\nBookings:");
        foreach (var b in _service.Bookings)
            Console.WriteLine($"ID: {b.Id} | {b}");

        Console.Write("ID to simulate: ");
        var id = Console.ReadLine()?.Trim();

        try
        {
            _service.SimulateBookingProgress(id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    static void ViewBookings()
    {
        Console.WriteLine("\nBookings:");
        if (!_service.Bookings.Any()) { Console.WriteLine("None."); return; }

        foreach (var b in _service.Bookings)
            Console.WriteLine($"ID: {b.Id} | {b}");
    }
}