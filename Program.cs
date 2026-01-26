using ConferenceBooking.Domain.Models;
using System;

class Program
{
    static void Main()
    {
        try
        {
            var room = ConferenceRoom.Create(
                roomid: "BRD-101",
                roomname: "Executive Boardroom",
                capacity: 12,
                location: "Floor 4, Bitcube HQ",
                amenities: RoomAmenity.Projector | RoomAmenity.VideoConference | RoomAmenity.NaturalLight
            );

            Console.WriteLine("Created room: " + room);

            var booking = Booking.Create(
                bookingid: "BOOK-20260126-001",
                roomId: room.RoomID,
                bookedByUserId: "USR-juniorsillo123",
                startTime: new DateTime(2026, 2, 1, 10, 0, 0, DateTimeKind.Utc),
                endTime: new DateTime(2026, 2, 1, 11, 30, 0, DateTimeKind.Utc),
                purpose: "Q1 Strategy Meeting"
            );

            Console.WriteLine("Created booking: " + booking);

            // Demonstrate status change
            booking.ChangeStatus(BookingStatus.Approved);
            Console.WriteLine("After approval: " + booking);

          
            // Overlap checking example(COnflict detection)
            var overlaps = booking.OverlapsWith(
                new DateTime(2026, 2, 1, 11, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 2, 1, 12, 0, 0, DateTimeKind.Utc));

            Console.WriteLine($"Overlaps with 11:00-12:00? {overlaps}"); // true
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.Message);
        }
    }
}