using ConferenceBooking.Domain.Models;
using ConferenceBooking.Logic;
using ConferenceBookingWebApi.Data;
using ConferenceBookingWebApi.Hubs; 
using ConferenceBookingWebApi.Middleware;
using ConferenceBookingWebApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using ConferenceBooking.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure DbContext with PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Configure JWT authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddAuthorization();

// Add SignalR
builder.Services.AddSignalR();

// Configure controllers with Newtonsoft JSON
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Conference Booking API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT with Bearer into field",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// Register services
builder.Services.AddSingleton<SeedData>();
builder.Services.AddScoped<BookingManager>();

// Configure CORS — allows both the old Vite dev server and the new Next.js dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",  // Vite (previous frontend)
                "http://localhost:3000"   // Next.js (current frontend)
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Global exception middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");       // ← must come before UseAuthentication
app.UseAuthentication();
app.UseAuthorization();

// Map SignalR Hub
app.MapHub<BookingHub>("/bookingHub"); 

app.MapControllers();

// Seed database and load bookings at startup
app.Lifetime.ApplicationStarted.Register(async () =>
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;

    // Apply EF Core migrations
    var dbContext = services.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();

    // Seed Identity roles & users
    await IdentitySeeder.SeedAsync(services, app.Configuration);

    // Seed rooms into database
    var seedData = services.GetRequiredService<SeedData>();
    var rooms = seedData.SeedRooms();

    foreach (var room in rooms)
    {
        if (!dbContext.Rooms.Any(r => r.RoomID == room.RoomID))
        {
            dbContext.Rooms.Add(room);
        }
    }
    await dbContext.SaveChangesAsync();

    // Load bookings (EF Core)
    var bookingManager = services.GetRequiredService<BookingManager>();
    await bookingManager.LoadBookingsAsync();

    Console.WriteLine("✅ Backend started successfully with PostgreSQL + rooms seeded + CORS enabled + SignalR Hub mapped.");
});

app.Run();