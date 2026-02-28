import Button from './Button.jsx'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Conference Bookings</h2>
        {token && <button onClick={onLogout}>Logout</button>} {/* ← pass onLogout from App */}
      </div>

      <div className="navbar-links">
        <Button label="Dashboard" variant="text" />
        <Button label="My Bookings" variant="text" />
        <Button label="Rooms" variant="text" />
        <Button label="Login" variant="primary" />
      </div>
    </nav>
  )
}

export default Navbar