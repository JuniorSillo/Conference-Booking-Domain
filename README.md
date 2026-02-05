# Conference Booking System API



## Overview

This project implements a robust, scalable RESTful API for the Conference Booking System using ASP.NET Core Web API. It exposes the domain logic from previous assignments over HTTP, ensuring clear separation of concerns, thin controllers, and reuse of existing business rules. The API supports booking operations with validation, conflict detection, and persistence using JSON files. It is designed for high reliability, with explicit error handling and meaningful HTTP status codes. 

Built with modern .NET 8 practices, the API is testable via Swagger UI and adheres to professional standards for API design, including DTOs for input/output, data annotations for validation, and a consistent error response format.

### Project Context

This is the implementation for **Assignment 2.2: Strengthening the API Contract**. It builds on a clean domain model with centralized business rules, async file persistence, and explicit error handling. The transition from console to HTTP maintains the core logic without duplication, focusing on API boundary safety, validation, and response precision.

## Features

- **Booking Operations**:
  - Create bookings with automatic approval (for demo)
  - List all bookings
  - Get booking by ID
  - Update booking times (with conflict checks)
  - Cancel bookings (status change)
  - Delete bookings

- **Room Operations**:
  - List all rooms (seeded with 10 varied rooms)
  - Get available rooms for a given time slot (filters based on bookings)

- **Advanced Functionality**:
  - **Double Booking Prevention**: Automatic conflict detection for overlapping times on the same room (throws 409 Conflict)
  - **Validation**: Input validation using DataAnnotations (400 Bad Request for invalid data)
  - **Error Handling**: Consistent error responses with error codes, messages, and details (e.g., 422 for domain violations, 404 for not found)
  - **Persistence**: Async JSON file storage for bookings (loads on startup, saves on changes)

- **Technical Highlights**:
  - Thin controllers: Coordinate DTO mapping, validation, and service calls only
  - DTOs for API contract: Separate from domain models to protect internal structures
  - Precise HTTP status codes: 201 Created, 200 OK, 204 No Content, 400 Bad Request, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 500 Internal Server Error
  - Swagger integration: Built-in API documentation and testing

## Installation

### Prerequisites
- .NET 8.0 SDK or higher
- Git (for cloning the repository)

### Setup

1. **Clone the repository**:
   ```
   git clone [your-repo-link]
   cd Conference-Booking-Demo/ConferenceBookingWebApi
   ```

2. **Restore dependencies**:
   ```
   dotnet restore
   ```

3. **Build the project**:
   ```
   dotnet build
   ```

4. **Run the API**:
   ```
   dotnet run
   ```

   - The API will start on `https://localhost:5051` (or your configured port)
   - Open Swagger UI at `https://localhost:5051/swagger`

## Usage

### Running the API

- Start the server with `dotnet run`.
- Use Swagger UI (`/swagger`) to explore and test endpoints.
- Bookings are persisted in `bookings.json` in the project root (loads on startup, saves on changes).

### Testing Examples

1. **List Rooms** (GET `/api/Rooms`):
   - Returns 10 seeded rooms with details (capacity, type, amenities).

2. **Create Booking** (POST `/api/Bookings`):
   - Body:
     ```
     {
       "roomID": "CR001",
       "startTime": "2026-02-05T10:00:00Z",
       "endTime": "2026-02-05T11:00:00Z"
     }
     ```
   - Success: 201 Created with booking details
   - Overlap: 409 Conflict with error message

3. **List Bookings** (GET `/api/Bookings`):
   - Returns all bookings in DTO format.

4. **Get Booking by ID** (GET `/api/Bookings/{id}`):
   - Use ID from create response.

5. **Update Booking** (PUT `/api/Bookings/{id}`):
   - Body:
     ```
     {
       "startTime": "2026-02-05T11:00:00Z",
       "endTime": "2026-02-05T12:00:00Z"
     }
     ```
   - Success: 200 OK
   - Conflict: 409

6. **Cancel Booking** (POST `/api/Bookings/{id}/cancel`):
   - Success: 200 OK

7. **Delete Booking** (DELETE `/api/Bookings/{id}`):
   - Success: 204 No Content

8. **Available Rooms** (GET `/api/Rooms/available?start=2026-02-05T10:00:00Z&end=2026-02-05T11:00:00Z`):
   - Returns rooms not booked in that slot.

### Error Handling

All errors use a consistent format:
```
{
  "errorCode": "ValidationError",
  "message": "Invalid request data",
  "details": "Details here"
}
```
- 400: Validation failures
- 404: Not found
- 409: Conflicts (e.g. double booking)
- 422: Domain rule violations (e.g. end time before start)
- 500: Unexpected server errors

## API Endpoints

| Method | Endpoint | Description | Request Body | Response Codes |
|--------|----------|-------------|--------------|----------------|
| GET | `/api/Rooms` | List all rooms | None | 200 OK |
| GET | `/api/Rooms/available?start={datetime}&end={datetime}` | List available rooms in time slot | None | 200 OK, 400 Bad Request |
| GET | `/api/Bookings` | List all bookings | None | 200 OK |
| GET | `/api/Bookings/{id}` | Get booking by ID | None | 200 OK, 404 Not Found |
| POST | `/api/Bookings` | Create booking | CreateBookingRequest | 201 Created, 400, 409, 422 |
| PUT | `/api/Bookings/{id}` | Update booking time | UpdateBookingRequest | 200 OK, 400, 404, 409, 422 |
| POST | `/api/Bookings/{id}/cancel` | Cancel booking | None | 200 OK, 404 |
| DELETE | `/api/Bookings/{id}` | Delete booking | None | 204 No Content, 404 |

## Design Choices

- **Separation of Concerns**: Controllers only handle HTTP mapping, validation, and service coordination. Business rules (conflict detection, status transitions) are in `BookingManager`.
- **DTOs**: Input (Create/UpdateRequest) and output (Booking/RoomDto) DTOs protect domain models and allow API evolution.
- **Validation**: DataAnnotations for input checks; domain rules throw exceptions mapped to status codes.
- **Persistence**: Async JSON file for simplicity; easily replaceable with a database.
- **Error Handling**: Centralized try-catch in controllers; consistent ErrorResponseDto for all failures.
- **Logging**: Console logs for errors and operations to aid debugging.

## Known Limitations

- In-memory booking list (reloaded from file on startup).
- Auto-approval for bookings (for demo; add approval flow in future assignments).
- No authentication (add in future for production).

---  

Developed with .NET 8, ASP.NET Core, and Swagger for seamless API exploration.  

© 2026 Moeketsi Junior Sillo. All rights reserved.
