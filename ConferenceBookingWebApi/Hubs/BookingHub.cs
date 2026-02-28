using Microsoft.AspNetCore.SignalR;

namespace ConferenceBookingWebApi.Hubs;

public class BookingHub : Hub
{
    
    public async Task JoinBookingUpdates()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Bookings");
    }

    
    public async Task SendBookingUpdate(string message)
    {
        await Clients.All.SendAsync("ReceiveBookingUpdate", message);
    }
}