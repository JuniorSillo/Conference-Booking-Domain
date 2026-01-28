## Overview

This repository contains a complete domain model and business logic implementation in C# for a **Conference Room Booking System**, developed across **Assignment 1.1** (domain modelling) and **Assignment 1.2** (business logic & collections).

- **Assignment 1.1**: Focused on clean domain modelling with intentional C# constructs (records, enums, factory methods, encapsulation, invariants).
- **Assignment 1.2**: Extended with collections (`List<T>`), LINQ queries, a service layer for business rules (overlap detection, fail-fast validation), and an interactive console demo that enforces real-world booking rules.

Key features:
- Domain entities: `ConferenceRoom`, `Booking`, `BookingStatus` (enum), `RoomAmenity` (flags enum)
- Business logic in `BookingService`: handles room/booking collections, prevents double-bookings, validates room existence and state transitions
- Interactive console: 10 pre-defined rooms auto-loaded, user inputs name, requested capacity, amenities, times, and purpose when booking
- Status progression simulation: bookings move through Pending → Approved → Completed with 5-second delays for realistic demo
- Lecturer feedback addressed: `Booking` now references `ConferenceRoom` object directly (no more `string RoomId`)

No external libraries are used — only .NET 8 Standard Library.

## Design Decisions

### Assignment 1.1 (Domain Modelling)
1. **ConferenceRoom** as `record class`  
   Reference type with identity (ID), concise syntax, immutability where possible (`init`), private setters for encapsulation. Factory method enforces invariants (positive capacity, non-empty ID/name/location).

2. **Booking** as `record class`  
   Immutable core properties, `with` expressions for safe updates, factory method validates time rules (start < end, ≥15 min), behavior methods (`ChangeStatus`, `OverlapsWith`).

3. **Enums**  
   - `BookingStatus`: Finite lifecycle states (Pending, Approved, Rejected, Cancelled, Completed) — prevents magic strings.  
   - `RoomAmenity` with `[Flags]`: Bitwise combination of features.

4. **General**  
   - Encapsulation: private constructors + factories, no public setters on critical fields.  
   - Fail-fast: exceptions for invalid state.  
   - Business naming: `Purpose` instead of `Description`.

### Assignment 1.2 Additions (Business Logic & Collections)
- **Service layer** (`BookingService`): Contains `List<ConferenceRoom>` and `List<Booking>`, exposes read-only views.  
- **LINQ usage**: `FirstOrDefault`, `Where`, `Any` for room lookup, overlap checks, filtering bookings.  
- **Business rules enforced**:  
  - No double-booking (overlap check on Approved bookings in same room)  
  - Booking must reference existing room  
  - Valid state transitions only (`ChangeStatus` enforces rules)  
  - Fail-fast: early exceptions for missing room, conflicts, invalid times/capacity  
  - User-requested capacity & amenities validated against room capabilities  
- **Interactive console**:  
  - 10 pre-defined rooms auto-loaded at startup (user chooses by ID)  
  - User inputs: name, booking ID, room ID, requested capacity, amenities (multi-select), start/end time, purpose  
  - Optional 5-second-per-step status progression simulation (Pending → Approved → Completed)  
- **Lecturer feedback fix**: Replaced `string RoomId` with direct `ConferenceRoom Room` reference in `Booking`.

## Folder Structure

```
ConferenceBooking.Domain/
└── ConsoleDemo/
    ├── Models/
    │   ├── RoomAmenity.cs          # Flags enum for room features
    │   ├── BookingStatus.cs        # Booking lifecycle states
    │   ├── ConferenceRoom.cs       # Room entity with factory & validation
    │   └── Booking.cs              # Booking entity with requested capacity/amenities
    ├── Services/
    │   └── BookingService.cs       # Business logic, collections, LINQ rules
    ├── Program.cs                  # Interactive console demo (menu-driven)
    ├── ConsoleDemo.csproj
    ├── .gitignore
    └── README.md                   # This file
```

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/JuniorSillo/conference-booking-domain.git
   ```

2. Navigate:
   ```bash
   cd ConferenceBooking.Domain/ConsoleDemo
   ```

3. Build & run:
   ```bash
   dotnet build
   dotnet run
   ```

**What happens when you run it:**
- 10 pre-defined rooms are loaded automatically (you'll see them listed).
- Menu appears:
  1. View rooms
  2. Make booking → enter name, capacity needed, amenities needed, room ID, times, etc.
  3. Simulate progress → watch status change every 5 seconds
  4. View bookings
  5. Exit

If you enter invalid data (overlap, wrong capacity, missing amenities), it fails fast with clear messages.

## Requirements & Constraints Followed

- .NET 8 console app only (no DB, no web, no external packages)
- Collections (`List<T>`) + LINQ for business logic
- Separation of concerns: domain models vs service layer vs console orchestration
- Git commits: logical units with clear messages
- All required Assignment 1.2 rules enforced (overlap, existing room, valid states, fail-fast)

## Potential Extensions

- Add user roles / approval workflow
- Persist to database (EF Core)
- Timezone handling (currently UTC)
- Search available slots (LINQ-based)
- Cancel/Reject simulation

**Created by:** MOEKETSI JUNIOR SILLO  
**Date:** January 2026  
**Location:** Bloemfontein, Free State, ZA
