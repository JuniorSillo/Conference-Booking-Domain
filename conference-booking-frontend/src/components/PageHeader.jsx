
import LoadingSpinner from './LoadingSpinner.jsx'

function PageHeader({ isSyncing }) {
  return (
    <header className="page-header">
      <h1 className="page-title">Conference Bookings</h1>
      {isSyncing && (
        <span className="syncing-badge">
          <LoadingSpinner />
          Syncing…
        </span>
      )}
    </header>
  )
}

export default PageHeader