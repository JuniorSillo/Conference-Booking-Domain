using System.Text.Json;
using ConferenceBooking.Domain.Models;

namespace ConferenceBooking.Persistence;

public class BookingFileStore
{
    private readonly string _filePath;

    public BookingFileStore(string filePath)
    {
        _filePath = filePath ?? throw new ArgumentNullException(nameof(filePath));
    }

    public async Task SaveAsync(IEnumerable<Booking> bookings)
    {
        var options = new JsonSerializerOptions { WriteIndented = true };
        string json = JsonSerializer.Serialize(bookings, options);
        await File.WriteAllTextAsync(_filePath, json);
    }

    public async Task<List<Booking>> LoadAsync()
    {
        if (!File.Exists(_filePath))
            return new List<Booking>();

        string json = await File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<Booking>>(json)
               ?? new List<Booking>();
    }
}
