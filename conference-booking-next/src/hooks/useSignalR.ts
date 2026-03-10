
import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export function useSignalR(onUpdate: (message: string) => void) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookingHub`)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => {
        console.log('SignalR connected');
        connection.invoke('JoinBookings');
      })
      .catch((err: any) => console.error('SignalR connection failed:', err));

    connection.on('ReceiveBookingUpdate', (message: string) => {
      console.log('Real-time update:', message);
      onUpdate(message);
    });

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        console.log('SignalR disconnected');
      }
    };
  }, [onUpdate]);

  return connectionRef.current;
}