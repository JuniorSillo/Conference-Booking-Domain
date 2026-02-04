using System;

namespace ConferenceBooking.Domain.Models;

[Flags]
public enum RoomAmenity
{
    None = 0,
    Projector = 1 << 0,
    Whiteboard = 1 << 1,
    VideoConference = 1 << 2,
    SpeakerPhone = 1 << 3,
    AirConditioning = 1 << 4,
    NaturalLight = 1 << 5,
    CoffeeMachine = 1 << 6
}