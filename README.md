# Conference Booking System API

## Overview

This project implements a robust, scalable, **secure**, and **persistent** RESTful API for the Conference Booking System using ASP.NET Core Web API (.NET 8).

It exposes domain logic from previous assignments over HTTP with:
- Clear separation of concerns
- Thin controllers
- Centralized business rules
- Async EF Core persistence
- Explicit error handling
- Role-based authorization

The API includes full authentication and authorization using **ASP.NET Core Identity** and **JWT**, enforcing role-based access for all operations. Data is now **persistently stored** in a SQLite database (`app.db`) using Entity Framework Core, surviving application restarts and supporting schema evolution.

### Project Context

This implementation covers **Assignments 2.1 through 3.2**:

- 2.1: Domain model & business logic
- 2.2: API contract with DTOs, validation, precise status codes
- 2.3: Centralized failure handling & middleware
- 2.4: Authentication (JWT), authorization (roles), secure endpoints
- 3.1: Full EF Core persistence (replaced in-memory/JSON storage)
- 3.2: Schema evolution & migrations (added new fields safely)

## Features

- **Booking Operations** (secured & persisted):
  - Create bookings (Employee)
  - List all bookings (Admin)
  - Get booking by ID (all authenticated roles)
  - Update booking time (Employee)
  - Cancel own booking (Employee)
  - Delete booking (Admin)

- **Room Operations**:
  - List all rooms (seeded with 10 varied rooms)
  - Get available rooms for a given time slot

- **Session Operations** (new in 3.2):
  - Seeded sessions with capacity, start/end times

- **Authentication & Authorization**:
  - Login endpoint (`POST /api/auth/login`) → returns JWT
  - Role-based access: Employee, Admin, Receptionist, FacilitiesManager
  - Protected endpoints return 401 (unauthenticated) or 403 (unauthorized)

- **Persistence & Durability**:
  - Full EF Core + SQLite storage
  - Data survives app restarts
  - Schema evolution via migrations (additive changes only)

- **Advanced Functionality**:
  - Double-booking prevention (409 Conflict)
  - Input validation (400 Bad Request)
  - Centralized error handling with categories
  - Async operations throughout
  - Structured logging of failures

- **Technical Highlights**:
  - Thin controllers + centralized middleware
  - DTOs for input/output contract safety
  - ASP.NET Core Identity + EF Core for users/roles
  - JWT Bearer authentication
  - Swagger with Bearer token support
  - Precise HTTP status codes
  - Repeatable, idempotent seeding

## Installation

### Prerequisites
- .NET 8.0 SDK or higher
- Git
- EF Core CLI tools (`dotnet tool install --global dotnet-ef`)

### Setup

1. **Clone the repository**:
   ```
   git clone [your-repo-link]
   cd Conference-Booking-Demo/ConferenceBookingWebApi
   ```

2. **Install dependencies**:
   ```
   dotnet restore
   ```

3. **Apply database migrations** (creates Identity + domain tables):
   ```
   dotnet ef migrations add InitialWithIdentity
   dotnet ef database update
   ```

4. **Build & run**:
   ```
   dotnet build
   dotnet run
   ```

   - API runs on `https://localhost:5051` (or your configured port)
   - Swagger UI: `https://localhost:5051/swagger`
   - Database file: `app.db` (SQLite) in project root

## Usage

### Authentication Flow

1. **Login** (POST `/api/auth/login`):
   ```json
   {
     "email": "admin@demo.com",
     "password": "*******"
   }
   ```
   Response:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "expires": "2026-02-10T09:21:00Z"
   }
   ```

2. **Use the token**:
   - Header: `Authorization: Bearer {token}`
   - Try protected endpoints (e.g., GET `/api/Bookings`)

### Seeded Users (for testing)

| Email                  | Password   | Role              |
|------------------------|------------|-------------------|
| employee@demo.com      | ********   | Employee          |
| admin@demo.com         | ********   | Admin             |
| reception@demo.com     | ********   | Receptionist      |
| facilities@demo.com    | ********   | FacilitiesManager |

### Protected Endpoints Summary

| Endpoint                       | Method | Required Role(s)                     | Description                     |
|--------------------------------|--------|--------------------------------------|---------------------------------|
| `/api/auth/login`              | POST   | Public                               | Authenticate & get JWT          |
| `/api/Rooms`                   | GET    | Public                               | List all rooms                  |
| `/api/Rooms/available?...`     | GET    | Public                               | Available rooms in time slot    |
| `/api/Bookings`                | GET    | Admin                                | List all bookings               |
| `/api/Bookings/{id}`           | GET    | Authenticated                        | Get single booking              |
| `/api/Bookings`                | POST   | Employee                             | Create booking                  |
| `/api/Bookings/{id}`           | PUT    | Employee                             | Update booking time             |
| `/api/Bookings/{id}/cancel`    | POST   | Employee                             | Cancel own booking              |
| `/api/Bookings/{id}`           | DELETE | Admin                                | Delete booking                  |

### Error Handling

All errors return a consistent JSON shape:
```json
{
  "errorCategory": "BusinessRuleViolation",
  "errorCode": "TimeSlotConflict",
  "message": "Time slot overlaps with an existing booking.",
  "details": null
}
```
- 401 Unauthorized → missing/invalid token
- 403 Forbidden → authenticated but wrong role
- 400 Bad Request → validation failure
- 409 Conflict → double booking / invalid state
- 500 Internal Server Error → unexpected server error

## Design Choices

- **Separation of Concerns** — Controllers only handle HTTP; business rules in `BookingManager`; persistence in `ApplicationDbContext`.
- **DTOs** — Input/output contract protection.
- **Centralized Errors** — Global middleware for consistent shape and logging.
- **Security** — ASP.NET Core Identity + JWT + role-based authorization.
- **Persistence** — EF Core + SQLite (durable across restarts, supports schema evolution).
- **Seeding** — Roles/users seeded at startup (configuration-driven); rooms seeded in-memory.

## Known Limitations

- JWT key hardcoded in config (use secrets management in production)
- SQLite database (easily swappable to PostgreSQL/SQL Server)
- Auto-approval for bookings (demo)
- No advanced session booking flow yet

## Installation & Testing

See Setup section above.  
Test flow:
1. `dotnet run`
2. Login → get JWT
3. Use Bearer token for protected endpoints
4. Create booking → restart app → list bookings → data persists
5. Verify 401/403 on missing/wrong permissions

---  

Developed with .NET 8, ASP.NET Core, EF Core, Identity, JWT, Swagger, and centralized middleware.  

© 2026 Moeketsi Junior Sillo. All rights reserved.
