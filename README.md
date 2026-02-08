
# Conference Booking System API


## Overview

This project implements a robust, scalable, and **secure** RESTful API for the Conference Booking System using ASP.NET Core Web API (.NET 8). It exposes domain logic from previous assignments over HTTP with clear separation of concerns, thin controllers, centralized business rules, async persistence, explicit error handling, and role-based authorization.

The API now includes full authentication and authorization using **ASP.NET Core Identity** and **JWT**, enforcing role-based access for all booking operations. It is designed for high reliability, security, and future extensibility (e.g., database-backed ownership).

### Project Context

This implementation covers **Assignments 2.1 through 2.4**:
- 2.1: Domain model & business logic
- 2.2: API contract with DTOs, validation, precise status codes
- 2.3: Centralized failure handling & middleware
- 2.4: Authentication (JWT), authorization (roles), and secure endpoints

## Features

- **Booking Operations** (secured):
  - Create bookings (Employee)
  - List all bookings (Admin)
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

- **Advanced Functionality**:
  - Double-booking prevention (409 Conflict)
  - Input validation (400 Bad Request)
  - Centralized error handling with categories (ClientValidation, BusinessRuleViolation, UnexpectedError)
  - Async JSON file persistence (loads on startup, saves on changes)
  - Structured logging of failures (no sensitive data exposed)

- **Technical Highlights**:
  - Thin controllers with centralized middleware
  - DTOs for input/output contract safety
  - ASP.NET Core Identity + EF Core (SQLite) for users/roles
  - JWT Bearer authentication
  - Swagger with Bearer token support
  - Precise HTTP status codes (401, 403, 409, etc.)

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

3. **Apply database migrations** (creates Identity tables):
   ```
   dotnet ef migrations add IdentitySetup
   dotnet ef database update
   ```

4. **Build & run**:
   ```
   dotnet build
   dotnet run
   ```

   - API runs on `https://localhost:5051` (or your configured port)
   - Swagger UI: `https://localhost:5051/swagger`

## Usage

### Authentication Flow

1. **Login** (POST `/api/auth/login`):
   ```json
   {
     "email": "admin@demo.com",
     "password": "Pass123!"
   }
   ```
   Response:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "expires": "2026-02-09T09:21:00Z"
   }
   ```

2. **Use the token**:
   - Header: `Authorization: Bearer {token}`
   - Try protected endpoints (e.g., GET `/api/Bookings`)

### Seeded Users (for testing)

| Email                  | Password   | Role              |
|------------------------|------------|-------------------|
| employee@demo.com      | Pass123!   | Employee          |
| admin@demo.com         | Pass123!   | Admin             |
| reception@demo.com     | Pass123!   | Receptionist      |
| facilities@demo.com    | Pass123!   | FacilitiesManager |

### Protected Endpoints Summary

| Endpoint                       | Method | Required Role(s)                     | Description                     |
|--------------------------------|--------|--------------------------------------|---------------------------------|
| `/api/Bookings`                | GET    | Admin                                | List all bookings               |
| `/api/Bookings/{id}`           | GET    | Employee, Admin, Receptionist, FacilitiesManager | Get single booking |
| `/api/Bookings`                | POST   | Employee                             | Create booking                  |
| `/api/Bookings/{id}`           | PUT    | Employee                             | Update booking time             |
| `/api/Bookings/{id}/cancel`    | POST   | Employee                             | Cancel own booking              |
| `/api/Bookings/{id}`           | DELETE | Admin                                | Delete booking                  |

### Error Handling

All errors return a consistent JSON shape:
```json
{
  "errorCategory": "ClientValidation",
  "errorCode": "InvalidTimeRange",
  "message": "End time must be after start time.",
  "details": "Please check the start and end times."
}
```
- 401 Unauthorized → missing/invalid token
- 403 Forbidden → authenticated but wrong role
- 400 Bad Request → validation failure
- 409 Conflict → double booking
- 500 Internal Server Error → unexpected server error

## API Endpoints

| Method | Endpoint                        | Description                          | Authorization       | Response Codes          |
|--------|---------------------------------|--------------------------------------|---------------------|-------------------------|
| POST   | `/api/auth/login`               | Authenticate & get JWT               | Public              | 200, 401                |
| GET    | `/api/Rooms`                    | List all rooms                       | Public              | 200                     |
| GET    | `/api/Rooms/available?...`      | Available rooms in time slot         | Public              | 200, 400                |
| GET    | `/api/Bookings`                 | List all bookings                    | Admin               | 200, 401, 403           |
| GET    | `/api/Bookings/{id}`            | Get booking by ID                    | Authenticated       | 200, 401, 403, 404      |
| POST   | `/api/Bookings`                 | Create booking                       | Employee            | 201, 400, 401, 403, 409 |
| PUT    | `/api/Bookings/{id}`            | Update booking time                  | Employee            | 200, 400, 401, 403, 404 |
| POST   | `/api/Bookings/{id}/cancel`     | Cancel booking                       | Employee            | 200, 401, 403, 404      |
| DELETE | `/api/Bookings/{id}`            | Delete booking                       | Admin               | 204, 401, 403, 404      |

## Design Choices

- **Separation of Concerns** — Controllers only handle HTTP; business rules in `BookingManager`.
- **DTOs** — Input/output contract protection.
- **Centralized Errors** — Global middleware for consistent shape and logging.
- **Security** — ASP.NET Core Identity + JWT + role-based authorization.
- **Persistence** — Async JSON file (load at startup, save on change).
- **Seeding** — Roles/users seeded at startup for demo/testing.

## Known Limitations

- In-memory booking list (reloaded from JSON on startup).
- Auto-approval for bookings (demo).
- JWT key hardcoded in config (use secrets management in production).
- SQLite database (easily swappable to PostgreSQL/SQL Server).

## Installation & Testing

See Setup section above.  
Test flow:
1. `dotnet run`
2. Login → get JWT
3. Use Bearer token for protected endpoints
4. Verify 401/403 on missing/wrong permissions

---  

Developed with .NET 8, ASP.NET Core, Identity, JWT, Swagger, and centralized middleware.  

© 2026 Moeketsi Junior Sillo. All rights reserved.
