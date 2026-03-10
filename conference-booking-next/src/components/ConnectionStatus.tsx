"use client"; 

import { useState, useEffect } from "react";
import apiClient from '../lib/apiClient';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<string>('Checking...');
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/health`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.ok) {
        setStatus('Connected');
        setIsOnline(true);
      } else {
        setStatus('Backend Offline');
        setIsOnline(false);
      }
    } catch (err) {
      setStatus('Backend Offline');
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`px-2 py-1 text-sm font-semibold rounded ${isOnline ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
      {status}
    </div>
  );
}