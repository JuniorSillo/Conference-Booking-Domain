
import { useState, useEffect } from 'react'

export default function ConnectionStatus() {
  const [status, setStatus] = useState('Checking...')
  const [isOnline, setIsOnline] = useState(false)

  const checkConnection = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`, {
        method: 'GET',
        cache: 'no-store', // prevent caching
      })

      if (response.ok) {
        setStatus('Connected')
        setIsOnline(true)
      } else {
        setStatus('Backend Offline')
        setIsOnline(false)
      }
    } catch (err) {
      setStatus('Backend Offline')
      setIsOnline(false)
    }
  }

  useEffect(() => {
    // Initial check
    checkConnection()

    // Check every 10 seconds
    const interval = setInterval(checkConnection, 10000)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [])

  const style = {
    padding: '0.35rem 0.9rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 600,
    backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
    color: isOnline ? '#155724' : '#721c24',
    border: `1px solid ${isOnline ? '#c3e6cb' : '#f5c6cb'}`
  }

  return (
    <div style={style}>
      {status}
    </div>
  )
}