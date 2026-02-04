using ConferenceBooking.Domain.Models;
using ConferenceBooking.Logic;
using ConferenceBooking.Persistence;

using Microsoft.AspNetCore.Mvc;               
using Microsoft.OpenApi.Models;               

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Conference Booking API", Version = "v1" });
});

builder.Services.AddSingleton<SeedData>();
builder.Services.AddScoped<BookingManager>();
builder.Services.AddScoped<BookingFileStore>(sp => new BookingFileStore("bookings.json"));

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Conference Booking API v1"));
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();