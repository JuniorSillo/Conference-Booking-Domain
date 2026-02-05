using ConferenceBooking.Domain.Models;
using ConferenceBooking.Logic;
using ConferenceBooking.Persistence;
using ConferenceBooking.Data;
using Microsoft.OpenApi.Models;
using ConferenceBookingWebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add controllers with JSON options
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Conference Booking API", Version = "v1" });
});

// Register services
builder.Services.AddSingleton<SeedData>();
builder.Services.AddScoped<BookingManager>();
builder.Services.AddScoped<BookingFileStore>(sp =>
{
    var manager = sp.GetRequiredService<BookingManager>();
    return new BookingFileStore("bookings.json", manager);
});

var app = builder.Build();

// Global exception middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Conference Booking API v1"));
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Load bookings **after** app starts (non-blocking for build, but runs on first request or background)
app.Lifetime.ApplicationStarted.Register(async () =>
{
    using var scope = app.Services.CreateScope();
    var manager = scope.ServiceProvider.GetRequiredService<BookingManager>();
    await manager.LoadBookingsAsync();
});

app.Run();