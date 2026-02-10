# Persistence Design Notes – Assignment 3.1

## Why in-memory storage is not suitable for production

In-memory storage (e.g., List<T>) loses all data on application restart or crash.  
Multiple instances cannot share state.  
No support for concurrent access, transactions, or complex queries.  
Not durable — unsuitable for real systems with multiple users or long-lived data.

## What DbContext represents

`DbContext` is the bridge between domain entities and the database.  
It tracks changes, manages connections, executes queries, and handles transactions.  
It belongs in the **infrastructure/data layer** — never in controllers or domain logic.

## How EF Core fits into the architecture

- Domain → entities (`Booking`, `ConferenceRoom`)
- Application → `BookingManager` (business logic + EF queries)
- Infrastructure → `ApplicationDbContext` (EF configuration)
- Presentation → controllers (HTTP only, call manager)

This maintains layering: controllers → manager → DbContext → database.

## How this prepares the system for future needs

- **Relationships**: Easy to add foreign keys (e.g., Booking → User for ownership)
- **Ownership**: Add `UserId` to Booking → query "my bookings" or enforce "only owner can cancel"
- **Frontend usage**: Database persistence enables multi-user, real-time, and mobile/web frontends

EF Core + SQLite provides durable, relational persistence — scalable to PostgreSQL/MySQL later.