using ConferenceBooking.Domain.Models;
using ConferenceBooking.Logic;
using Newtonsoft.Json;

namespace ConferenceBooking.Persistence;

public class BookingFileStore
{
    private readonly string _filePath;
    private readonly BookingManager _manager;  

    public BookingFileStore(string filePath, BookingManager manager)
    {
        _filePath = filePath ?? throw new ArgumentNullException(nameof(filePath));
        _manager = manager ?? throw new ArgumentNullException(nameof(manager));
    }

    public async Task SaveAsync(IEnumerable<Booking> bookings)
    {
        string json = JsonConvert.SerializeObject(bookings, Formatting.Indented);
        await File.WriteAllTextAsync(_filePath, json);
    }

    public async Task<List<Booking>> LoadAsync()
    {
        if (!File.Exists(_filePath))
            return new List<Booking>();

        string json = await File.ReadAllTextAsync(_filePath);
        return JsonConvert.DeserializeObject<List<Booking>>(json) ?? new List<Booking>();
    }
}