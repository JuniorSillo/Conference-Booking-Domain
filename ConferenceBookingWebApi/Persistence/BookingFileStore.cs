using System.Text.Json;
using Newtonsoft.Json;
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