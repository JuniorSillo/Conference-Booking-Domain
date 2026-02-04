using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add controllers with JSON options
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
    });

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Conference Booking API", Version = "v1" });
});

// Register your services (we'll define classes later)
builder.Services.AddSingleton<ConferenceBooking.Data.SeedData>();
builder.Services.AddScoped<ConferenceBooking.Logic.BookingManager>();
builder.Services.AddScoped<ConferenceBooking.Persistence.BookingFileStore>(sp => new ConferenceBooking.Persistence.BookingFileStore("bookings.json"));

var app = builder.Build();

// Configure the HTTP pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Conference Booking API v1"));
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();