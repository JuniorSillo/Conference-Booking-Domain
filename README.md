# Conference-Booking-Domain

## Overview

This repository contains a domain model implementation in C# for a Conference Room Booking System, as per **Assignment 1.1: Domain Modelling with C#**. The focus is on modeling core business concepts and rules using intentional C# constructs (classes, records, enums) without building a full end-user application. This model enforces real-world constraints like valid booking times, positive room capacities, and state transitions for bookings.



Key concepts modeled:
- **ConferenceRoom**: Represents a physical or virtual meeting space with attributes like capacity and amenities.
- **Booking**: Represents a reservation request with time slots, status, and overlap checks.
- **BookingStatus**: Enum for booking lifecycle states ( Pending, Approved).
- **RoomAmenity**: Additional enum (flags-based) for room features like projectors or video conferencing.

No external libraries are used beyond the .NET Standard Library.

## Design Decisions

1. **ConferenceRoom** as `record class`:
   - Chosen for reference-type semantics (rooms have identity via ID) with record benefits: concise syntax, built-in `ToString()`, and value-based equality if needed.
   - Mutable properties ( Name) allow updates like renaming a room, but critical invariants ( Capacity > 0) are enforced in the factory method.
   - Private constructor AND static `Create` factory method prevents invalid states ( no empty IDs or negative capacity).

2. **Booking** as `record class`:
   - Reference type for identity (ID), but leverages record immutability for core properties ( StartTime, EndTime) to prevent accidental changes.
   - Factory method enforces rules: Start < End, minimum 15-minute duration, no past bookings (extendable).
   - Behavior methods: `ChangeStatus` (simple state machine to avoid invalid transitions), `OverlapsWith` (for conflict detection).
   - `with` expressions enable safe, immutable updates ( `booking with { Status = BookingStatus.Approved }`).

3. **Enums**:
   - **BookingStatus**: Restricts states to a finite set, preventing invalid strings or numbers at compile time.
   - **RoomAmenity** (with `[Flags]`): Allows bitwise combinations (e.g., Projector | Whiteboard) for flexible room features.

4. **General Principles**:
   - **Encapsulation**: No public fields; properties are read-only where possible. Behavior lives in the domain (not external services).
   - **Invariants**: Enforced via constructors/factories — throw exceptions for invalid input to fail fast.
   - **Naming**: Business-oriented ( "Purpose" instead of "Description").
   - **No primitives obsession**: Use `DateTime` with UTC kind for times; avoid strings for enums.
   - **Extensibility**: Ready for aggregates ( add collections of Bookings to Room), domain events ( BookingApproved), or validation libraries later.



## Folder Structure

```
ConferenceBooking.Domain/
└── ConsoleDemo/                  # .NET 8 console project for demo
    ├── Models/                   # Domain models
    │   ├── RoomAmenity.cs        # Flags enum for room features
    │   ├── BookingStatus.cs      # Enum for booking states
    │   ├── ConferenceRoom.cs     # Room entity
    │   └── Booking.cs            # Booking entity
    ├── Program.cs                # Minimal console demo to test models
    ├── ConsoleDemo.csproj        # Project file
    ├── .gitignore                # Git ignore for .NET artifacts
    └── README.md                 # This file (at root for repo visibility)
```

## How to Run

1. Clone the repository:
   ```
   git clone https://github.com/JuniorSillo/conference-booking-domain.git
   ```

2. Navigate to the project:
   ```
   cd ConferenceBooking.Domain/ConsoleDemo
   ```

3. Build and run:
   ```
   dotnet build
   dotnet run
   ```

Expected output (demonstrates creation, updates, and rules):
```
Created room: Executive Boardroom (BRD-101) – Capacity: 12, Location: Floor 4, North Wing, Amenities: Projector, VideoConference, NaturalLight
Created booking: Q1 Strategy Meeting – 2026-02-01 10:00 → 11:30 (Room BRD-101, Status: Pending, By: USR-juniorsillo99)
After approval: Q1 Strategy Meeting – 2026-02-01 10:00 → 11:30 (Room BRD-101, Status: Approved, By: USR-juniorsillo99)
Overlaps with 11:00-12:00? True
```

ND: If you try invalid inputs ( negative capacity), it throws meaningful exceptions.

## Requirements & Constraints Followed

- .NET 8 console app.
- No external NuGet packages.
- Git commits: Logical, clear messages ( "Add Booking record with creation rules").


## Potential Extensions

- Add aggregate roots ( Room as aggregate with Bookings collection).
- Integrate with persistence ( map to database tables).
- Add more rules ( max booking duration, user roles).

CREATED BY: MOEKETSI JUNIOR SILLO.
