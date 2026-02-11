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
- Efficient querying with filtering, pagination, sorting, and projection

The API includes full authentication and authorization using **ASP.NET Core Identity** and **JWT**, enforcing role-based access for all operations. Data is persistently stored in a SQLite database (`app.db`) using Entity Framework Core, surviving application restarts and supporting schema evolution.

### Project Context

This implementation covers **Assignments 2.1 through 3.3**:

- 2.1: Domain model & business logic
- 2.2: API contract with DTOs, validation, precise status codes
- 2.3: Centralized failure handling & middleware
- 2.4: Authentication (JWT), authorization (roles), secure endpoints
- 3.1: Full EF Core persistence (replaced in-memory/JSON storage)
- 3.2: Schema evolution & migrations (added new fields safely)
- 3.3: Querying, filtering, pagination, sorting, and performance-aware API design

## Features

- **Booking Operations** (secured & persisted):
  - Create bookings (Employee)
  - List all bookings with filtering, pagination, sorting (Admin)
  - Get booking by ID (all authenticated roles)
  - Update booking time (Employee)
  - Cancel own booking (Employee)
  - Delete booking (Admin)

- **Room Operations**:
  - List all rooms (seeded with 10 varied rooms)
  - Get available rooms for a given time slot

- **Authentication & Authorization**:
  - Login endpoint (`POST /api/auth/login`) → returns JWT
  - Role-based access: Employee, Admin, Receptionist, FacilitiesManager
  - Protected endpoints return 401 (unauthenticated) or 403 (unauthorized)

- **Persistence & Durability**:
  - Full EF Core + SQLite storage
  - Data survives app restarts
  - Schema evolution via additive migrations

- **Advanced Querying (Assignment 3.3)**:
  - Filtering: by room ID, location, date range, active rooms only
  - Pagination: page & pageSize with total count and total pages
  - Sorting: by start time, created at, room name (asc/desc)
  - Projection: lightweight `BookingSummaryDto` for list views
  - Performance: AsNoTracking() for read-only queries, IQueryable composition

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
   cd ConferenceBookingWebApi
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
     "password": "********"
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
| `/api/Bookings`                | GET    | Admin                                | List bookings with filter/pagination/sort |
| `/api/Bookings/{id}`           | GET    | Authenticated                        | Get single booking              |
| `/api/Bookings`                | POST   | Employee                             | Create booking                  |
| `/api/Bookings/{id}`           | PUT    | Employee                             | Update booking time             |
| `/api/Bookings/{id}/cancel`    | POST   | Employee                             | Cancel own booking              |
| `/api/Bookings/{id}`           | DELETE | Admin                                | Delete booking                  |

### Query Parameters for `/api/Bookings` (GET)

| Parameter       | Type     | Description                                      | Default    |
|-----------------|----------|--------------------------------------------------|------------|
| `roomId`        | string   | Filter by specific room ID                       | —          |
| `location`      | string   | Filter by room location (partial match)          | —          |
| `startDate`     | DateTime | Filter bookings starting on/after this date      | —          |
| `endDate`       | DateTime | Filter bookings starting on/before this date     | —          |
| `activeRoomsOnly` | bool   | Only show bookings in active rooms               | false      |
| `page`          | int      | Page number                                      | 1          |
| `pageSize`      | int      | Records per page                                 | 10         |
| `sortBy`        | string   | Sort field: starttime, createdat, roomname       | starttime  |
| `sortOrder`     | string   | Sort direction: asc / desc                       | asc        |

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
- **DTOs** — Input/output contract protection + lightweight projection for lists.
- **Centralized Errors** — Global middleware for consistent shape and logging.
- **Security** — ASP.NET Core Identity + JWT + role-based authorization.
- **Persistence** — EF Core + SQLite (durable across restarts, supports schema evolution).
- **Querying** — Database-level filtering/pagination/sorting using IQueryable + AsNoTracking for performance.
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
5. Test filtering: `/api/Bookings?location=Cape Town&page=1&pageSize=5&sortBy=starttime&sortOrder=desc`
6. Verify 401/403 on missing/wrong permissions

---  

Developed with .NET 8, ASP.NET Core, EF Core, Identity, JWT, Swagger, and centralized middleware.  

© 2026 Moeketsi Junior Sillo. All rights reserved.
