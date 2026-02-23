
import LoadingSpinner from './LoadingSpinner.jsx'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <LoadingSpinner />
      <p className="loading-text">Fetching your bookings…</p>
    </div>
  )
}

export default LoadingScreen