using System;

namespace ConferenceBooking.Domain.Models;


[Flags]
public enum RoomAmenity
{
    None             = 0, // 0
    Projector        = 1 << 0,   // 1
    Whiteboard       = 1 << 1,   // 2
    VideoConference  = 1 << 2,   // 4
    SpeakerPhone     = 1 << 3,   // 8
    NaturalLight     = 1 << 4    // 16
}