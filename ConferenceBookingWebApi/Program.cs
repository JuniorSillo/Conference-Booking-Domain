using ConferenceBooking.Domain.Models;
using ConferenceBooking.Logic;
using ConferenceBooking.Persistence;
using ConferenceBooking.Data;
using ConferenceBookingWebApi.Middleware;
using ConferenceBookingWebApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using ConferenceBookingWebApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext for Identity (SQLite)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=app.db"));

// Add Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Add JWT Authentication
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

// Add Authorization
builder.Services.AddAuthorization();

// Existing services
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

// Register your services
builder.Services.AddSingleton<SeedData>();
builder.Services.AddScoped<BookingManager>();
builder.Services.AddScoped<BookingFileStore>(sp =>
{
    var manager = sp.GetRequiredService<BookingManager>();
    return new BookingFileStore("bookings.json", manager);
});

var app = builder.Build();

// Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed roles/users + load bookings **only after app is fully started** (no build hang)
app.Lifetime.ApplicationStarted.Register(async () =>
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var bookingManager = services.GetRequiredService<BookingManager>();

    // Seed roles
    string[] roles = { "Employee", "Admin", "Receptionist", "FacilitiesManager" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    // Seed users
    var seedUsers = new[]
    {
        new { Email = "employee@demo.com", Password = "Pass123!", Role = "Employee" },
        new { Email = "admin@demo.com", Password = "Pass123!", Role = "Admin" },
        new { Email = "reception@demo.com", Password = "Pass123!", Role = "Receptionist" },
        new { Email = "facilities@demo.com", Password = "Pass123!", Role = "FacilitiesManager" }
    };

    foreach (var u in seedUsers)
    {
        var user = await userManager.FindByEmailAsync(u.Email);
        if (user == null)
        {
            user = new ApplicationUser { UserName = u.Email, Email = u.Email };
            var result = await userManager.CreateAsync(user, u.Password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, u.Role);
            }
        }
    }

    // Load bookings
    await bookingManager.LoadBookingsAsync();
});

app.Run();