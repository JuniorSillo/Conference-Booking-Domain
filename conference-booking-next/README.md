# Conference Booking System — Assignment 3.3 Production Polish

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Axios
- **Backend:** .NET 8 Web API, PostgreSQL, Entity Framework Core, SignalR
- **Auth:** JWT Bearer tokens via ASP.NET Identity

---

## Performance Optimizations

### How I Identified the Bottleneck
Using **React DevTools Profiler**, I recorded a session of typing in the
search bar on the bookings dashboard. The flame graph showed the entire
booking table re-rendering on **every keystroke** — even though the data
hadn't changed yet. Two problems were visible:

1. The filtered bookings array was being recalculated on every render
2. The `handleCancel` and `handleDelete` functions were new references
   on every render, causing all table rows to re-render unnecessarily

### How I Resolved It

**useMemo — filtered & sorted bookings**
```ts
const processedBookings = useMemo(() => {
  let result = [...allBookings];
  if (debouncedSearch.trim()) {
    result = result.filter(b => b.roomName.toLowerCase().includes(term));
  }
  result.sort(...);
  return result;
}, [allBookings, debouncedSearch, sortField, sortOrder]);
```
This only recalculates when the underlying data or sort/filter state
changes — not on every render.

**useMemo — stats strip**
```ts
const stats = useMemo(() => ({
  total:     totalCount,
  approved:  allBookings.filter(b => b.status === "Approved").length,
  ...
}), [allBookings, totalCount]);
```
Status counts only recalculate when the bookings array changes.

**useCallback — action handlers**
```ts
const handleCancel = useCallback(async (id) => { ... }, [page, fetchBookings, flash]);
const handleDelete = useCallback(async (id) => { ... }, [page, fetchBookings, flash]);
const handleEdit   = useCallback((b) => setEditTarget(b), []);
```
Stable function references prevent child rows from re-rendering when
unrelated state (like the search input) changes.

---

## Debounced Search

**File:** `src/hooks/useDebounce.ts`

```ts
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

Used in the dashboard:
```ts
const debouncedSearch = useDebounce(searchInput, 400);
```

The user sees instant visual feedback (a pulsing `…` indicator appears),
but the expensive filter calculation and any API calls only fire 400ms
after the last keystroke. This prevents flooding the backend with a
request for every character typed.

---

## Resilient UI Patterns

### loading.tsx
**File:** `src/app/dashboard/loading.tsx`

Next.js automatically renders this file while the dashboard page is
fetching data. It shows an animated skeleton that mirrors the exact
layout of the real page — stats strip, search bar, table rows — so
the user never sees a blank screen or a generic spinner.

### error.tsx
**File:** `src/app/dashboard/error.tsx`

Next.js wraps the dashboard in an Error Boundary that catches any
runtime errors thrown by the page (including network failures when the
.NET backend is offline). The `reset` prop retries rendering the page
component without a full browser refresh. It detects network errors
and shows a specific message guiding the developer to check port 5051.

---

## Full Request Chain

```
User types in search box
  → useDebounce waits 400ms
  → processedBookings (useMemo) recalculates
  → if page changes: fetchBookings() fires
    → apiClient.interceptors.request adds Bearer token
    → POST/GET http://localhost:5051/api/bookings
      → .NET BookingsController [Authorize] validates JWT
        → BookingManager queries PostgreSQL via EF Core
          → Returns PagedResultDto<BookingSummaryDto>
        → Response flows back to Axios
    → apiClient.interceptors.response unwraps response.data
      → on 401: calls logout() from AuthContext
    → React state updates → UI re-renders
```

---

## Environment Strategy

| File | Purpose |
|---|---|
| `.env.local` | Development — `NEXT_PUBLIC_API_BASE_URL=http://localhost:5051/api` |
| `.env.production` | Production — set to deployed API URL |

`NEXT_PUBLIC_` prefix exposes the variable to the browser bundle.
The `??` fallback in `apiClient.ts` ensures the app never silently
fails if the env file is missing.


