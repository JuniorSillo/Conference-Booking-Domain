using ConferenceBooking.Domain.Models;
using ConferenceBookingWebApi.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ConferenceBookingWebApi.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Booking> Bookings { get; set; }
    public DbSet<ConferenceRoom> Rooms { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

       
        builder.Entity<Booking>()
            .HasOne(b => b.Room)
            .WithMany()
            .HasForeignKey("RoomId")
            .OnDelete(DeleteBehavior.Restrict);
    }
}