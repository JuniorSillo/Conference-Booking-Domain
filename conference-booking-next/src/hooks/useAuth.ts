
import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

interface User {
  loggedIn: boolean;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
      setToken(storedToken);
      setUser({ loggedIn: true });
    }
    setAuthLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/login', { email, password });
      const newToken = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
      }
      setToken(newToken);
      setUser({ loggedIn: true });
      return response;
    } catch (err: any) {
      throw err.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return { token, user, authLoading, login, logout };
}