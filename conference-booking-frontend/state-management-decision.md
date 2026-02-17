## Why useState in the BookingForm Component (Not in App.jsx)

**Local state in `BookingForm.jsx`** was chosen over lifting all form state to `App.jsx` for the following reasons:

- **Separation of Concerns**: The form's internal data (room name, start/end times, validation errors) is only relevant while the user is filling out the form. Keeping this state local makes the component self-contained, easier to understand, and reusable in other contexts later.
- **Single Responsibility**: `BookingForm` is responsible for collecting and validating user input. Managing its own state keeps the form logic encapsulated — `App.jsx` only needs to know *how to add* a completed booking, not *how the form works*.
- **Better Performance & Predictability**: Storing form values in `App` would cause unnecessary re-renders of the entire app on every keystroke. Local `useState` limits re-renders to just the form.
- **Simpler Prop Drilling**: Only one function (`onAddBooking`) needs to be passed down — no need to pass setters for every field (roomName, startTime, etc.).

**Lifted state** (in `App.jsx`) is used only for the *list of bookings* because:
- Multiple components (`BookingCard` and the list view) need to read and update it.
- The list must reflect new bookings immediately and survive view changes (Past/Upcoming/Cancelled).

This follows the React principle: **"Lift state up" only as high as needed** — form state stays local, shared list state lives in the parent.

In short:  
Form state → local (encapsulated)  
Bookings list state → lifted to `App` (shared)
