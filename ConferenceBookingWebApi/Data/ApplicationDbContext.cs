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

        // Configure Booking primary key
        builder.Entity<Booking>()
            .HasKey(b => b.Id);

        // Configure ConferenceRoom primary key (assuming RoomID is PK)
        builder.Entity<ConferenceRoom>()
            .HasKey(r => r.RoomID);

        // Relationship: Booking to ConferenceRoom
        builder.Entity<Booking>()
            .HasOne(b => b.Room)
            .WithMany()
            .HasForeignKey(b => b.Room.RoomID)
            .OnDelete(DeleteBehavior.Restrict);
    }
}