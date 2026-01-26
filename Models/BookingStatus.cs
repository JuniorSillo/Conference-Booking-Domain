namespace ConferenceBooking.Domain.Models;

public enum BookingStatus
{
    Pending,     // Requested, awaiting for approval
    Approved,    // Confirmed and active
    Rejected,    // Denied by approver
    Cancelled,   // Cancelled by booker(Employees) or admin
    Completed    // Meeting has passed successfully
}