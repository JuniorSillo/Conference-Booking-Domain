using System.Text.Json;
using System.Text.Json.Serialization;
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
        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            Converters = { new JsonStringEnumConverter() }  // Enums as strings
        };
        string json = JsonSerializer.Serialize(bookings, options);
        await File.WriteAllTextAsync(_filePath, json);
    }

    public async Task<List<Booking>> LoadAsync()
    {
        if (!File.Exists(_filePath))
            return new List<Booking>();

        string json = await File.ReadAllTextAsync(_filePath);
        var options = new JsonSerializerOptions
        {
            Converters = { new JsonStringEnumConverter() }
        };
        return JsonSerializer.Deserialize<List<Booking>>(json, options)
               ?? new List<Booking>();
    }
}