namespace ConferenceBooking.Logic;
using ConferenceBooking.Domain.Models;

public class BookingManager
{
    // All the business logic for managing bookings would go here
    private readonly List<Booking> _bookings = new();

    public IReadOnlyList<Booking> GetBookings()
    {
        return _bookings.ToList();
    }

    public Booking CreateBooking(BookingRequest request)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request), "Booking request cannot be null.");
            }
            if(request.StartTime >= request.EndTime)
            {
                throw new ArgumentException("End time must be after start time.");
            }
            bool overlaps = _bookings.Any(b =>
                b.Room == request.Room &&
                b.BookingStatus == BookingStatus.Completed &&
                request.StartTime < b.EndTime &&
                request.EndTime > b.StartTime
                );
                if (overlaps)
                {
                    throw new BookingConflictException();
                }

                Booking booking = new Booking(
                    request.Room,
                    request.StartTime,
                    request.EndTime
                );

                booking.Complete();
                _bookings.Add(booking);


                return booking;

            
        }
    }