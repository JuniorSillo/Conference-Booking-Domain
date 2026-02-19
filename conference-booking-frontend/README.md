# Assignment 1.3 — README

## The "Cloudflare Incident" Explained

In June 2022, a Cloudflare outage was partially attributed to runaway processes caused by software feedback loops — a real-world example of the type of infinite loop React developers must guard against.

### What causes the infinite loop in React?

The pattern looks like this:

```js
// ⛔ DANGEROUS — infinite loop
useEffect(() => {
  fetchData().then(data => setBookings(data)) // sets state...
}, [bookings]) // ...which is a dependency → re-triggers the effect → repeat forever
```

Every time `setBookings` runs, `bookings` changes → the effect fires again → `setBookings` again → loop.

### How this project prevents it

We use a dedicated **`fetchTrigger`** integer as the sole fetch dependency:

```js
const [fetchTrigger, setFetchTrigger] = useState(0)

useEffect(() => {
  // fetch and call setBookings inside here...
}, [category, fetchTrigger]) // bookings is NOT here ✓
```

- `bookings` is **never** in the dependency array of the fetch effect.
- The only way to re-run the effect is to call `setFetchTrigger(n => n + 1)` from a user action (Retry / Refresh button) or by changing `category`.
- Because `fetchTrigger` is only changed by explicit user intent — never inside the effect itself — the loop is structurally impossible.

This is the "Cloudflare Rule" from the assignment spec: *do not update a state variable inside an effect that is also a dependency of that same effect without a conditional exit.*

---

## AbortController — Race Condition Safety

The `AbortController` is created **inside** the `useEffect` (not in component state). This means:

1. Each effect run gets its own fresh controller.
2. If the user clicks "Refresh" rapidly, each new effect run aborts the previous fetch via the cleanup function (`return () => controller.abort()`).
3. Aborted fetches throw an `AbortError`, which we catch and ignore — only real server errors update the error state.

This prevents **stale responses** from a slow previous fetch overwriting fresher data that arrived first.

---

## Heartbeat (setInterval Cleanup)

`Navbar.jsx` runs a `setInterval` that logs every 3 seconds. The cleanup function returned from `useEffect` calls `clearInterval` when the component unmounts, preventing a memory leak where the interval keeps firing after the component is gone.

```js
useEffect(() => {
  const id = setInterval(() => console.log('[Heartbeat] Checking...'), 3000)
  return () => clearInterval(id) // ← prevents memory leak
}, [])
```