import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export function useSignalR(onUpdate) {
  const connectionRef = useRef(null);

  useEffect(() => {
    // Create connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/bookingHub`)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Start connection
    connection.start()
      .then(() => {
        console.log('SignalR connected');
        connection.invoke('JoinBookings'); // join group
      })
      .catch(err => console.error('SignalR connection failed:', err));

    // Listen for updates
    connection.on('ReceiveBookingUpdate', (message) => {
      console.log('Real-time update:', message);
      onUpdate(message); // call callback to refresh bookings
    });

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        console.log('SignalR disconnected');
      }
    };
  }, [onUpdate]);

  return connectionRef.current;
}