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

        // Booking PK
        builder.Entity<Booking>()
            .HasKey(b => b.Id);

        // ConferenceRoom PK
        builder.Entity<ConferenceRoom>()
            .HasKey(r => r.RoomID);

        // Booking → Room relationship using scalar FK RoomID
        builder.Entity<Booking>()
            .HasOne(b => b.Room)
            .WithMany()  // no inverse navigation needed
            .HasForeignKey(b => b.RoomID)
            .OnDelete(DeleteBehavior.Restrict);
    }
}