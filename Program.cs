using ConferenceBooking.Domain.Models;
using System;

class Program
{
    static void Main()
    {
        try
        {
            Console.WriteLine("CONFERENCE BOOKING SYSTEM");

            Console.Write("Room ID: ");
            string roomId = Console.ReadLine()!;

            Console.Write("Room Name: ");
            string roomName = Console.ReadLine()!;

            Console.Write("Capacity: ");
            int capacity = int.Parse(Console.ReadLine()!);

            Console.Write("Location: ");
            string location = Console.ReadLine()!;

            Console.WriteLine("Select amenities:");
            Console.WriteLine("1 - Projector");
            Console.WriteLine("2 - Video Conference");
            Console.WriteLine("3 - Whiteboard");
            Console.WriteLine("4 - Natural Light");
            Console.Write("Your choice: ");

            string amenityInput = Console.ReadLine()!;
            RoomAmenity amenities = ParseAmenities(amenityInput);

            var room = ConferenceRoom.Create(
                roomid: roomId,
                roomname: roomName,
                capacity: capacity,
                location: location,
                amenities: amenities
            );

            Console.WriteLine("\nRoom created successfully:");
            Console.WriteLine(room);

            Console.WriteLine("\n BOOKING DETAILS ");

            Console.Write("Booking ID: ");
            string bookingId = Console.ReadLine()!;

            Console.Write("Booked By (User ID): ");
            string userId = Console.ReadLine()!;

            Console.Write("Purpose of meeting: ");
            string purpose = Console.ReadLine()!;

            Console.Write("Start Date & Time (yyyy-MM-dd HH:mm): ");
            DateTime startTime = DateTime.SpecifyKind(
                DateTime.Parse(Console.ReadLine()!),
                DateTimeKind.Utc);

            Console.Write("End Date & Time (yyyy-MM-dd HH:mm): ");
            DateTime endTime = DateTime.SpecifyKind(
                DateTime.Parse(Console.ReadLine()!),
                DateTimeKind.Utc);

            var booking = Booking.Create(
                bookingid: bookingId,
                roomId: room.RoomID,
                bookedByUserId: userId,
                startTime: startTime,
                endTime: endTime,
                purpose: purpose
            );

            Console.WriteLine("\nBooking created successfully:");
            Console.WriteLine(booking);

            Console.WriteLine("\nApproving booking...");
            booking.ChangeStatus(BookingStatus.Approved);
            Console.WriteLine("Updated booking:");
            Console.WriteLine(booking);
        }
        catch (Exception ex)
        {
            Console.WriteLine("\n❌ Error:");
            Console.WriteLine(ex.Message);
        }
    }

    private static RoomAmenity ParseAmenities(string input)
    {
        RoomAmenity result = RoomAmenity.None;

        var selections = input.Split(',', StringSplitOptions.RemoveEmptyEntries);

        foreach (var selection in selections)
        {
            switch (selection.Trim())
            {
                case "1":
                    result |= RoomAmenity.Projector;
                    break;
                case "2":
                    result |= RoomAmenity.VideoConference;
                    break;
                case "3":
                    result |= RoomAmenity.Whiteboard;
                    break;
                case "4":
                    result |= RoomAmenity.NaturalLight;
                    break;
            }
        }

        return result;
    }
}
