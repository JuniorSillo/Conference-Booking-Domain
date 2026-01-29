using System.Text.Json;
using ConferenceBooking.Domain.Models;

public class BookingFileStore
{
    // Implementation for storing bookings in a file would go here
    private readonly string _filePath;

    public BookingFileStore(string filePath)
    {
        _filePath = filePath;
    }
    public async Task SaveAsync(IEnumerable<Booking> bookings)
    {
        string json = JsonSerializer.Serialize(bookings);
        await File.WriteAllTextAsync(_filePath, json);
    }
    public async Task<List<Booking>> LoadAsync()
    {
        if(!File.Exists(_filePath))
        return new List<Booking>();

        string json = await File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<Booking>>(json)
        ?? new List<Booking>();
    }
}   