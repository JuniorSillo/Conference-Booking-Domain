using ConferenceBookingWebApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ConferenceBookingWebApi.Data;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // Seed roles
        string[] roles = { "Employee", "Admin", "Receptionist", "FacilitiesManager" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Seed users from configuration or defaults
        var seedUsers = configuration.GetSection("SeedUsers").Get<List<SeedUser>>() ?? new List<SeedUser>
        {
            new() { Email = "employee@demo.com", Password = "Pass123!", Role = "Employee" },
            new() { Email = "admin@demo.com", Password = "Pass123!", Role = "Admin" },
            new() { Email = "reception@demo.com", Password = "Pass123!", Role = "Receptionist" },
            new() { Email = "facilities@demo.com", Password = "Pass123!", Role = "FacilitiesManager" }
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
                    Console.WriteLine($"Seeded user: {u.Email} ({u.Role})");
                }
                else
                {
                    Console.WriteLine($"Failed to seed user {u.Email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
        }
    }

    private class SeedUser
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}