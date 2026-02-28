// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient.js'; 

export function useAuth() {
  // State for token (loaded from localStorage on page load)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  
  const [user, setUser] = useState(null);

  
  const [authLoading, setAuthLoading] = useState(true);

  
  useEffect(() => {
    if (token) {
      setUser({ loggedIn: true }); 
    }
    setAuthLoading(false);
  }, [token]);

  
  const login = async (email, password) => {
    try {
      
      const response = await apiClient.post('/auth/login', { email, password });

      
      const newToken = response.token;

      
      localStorage.setItem('token', newToken);

      
      setToken(newToken);

     
      setUser({ email });

      return response; 
    } catch (err) {
      
      throw err.response?.data?.message || 'Login failed';
    }
  };

  
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
   
    window.location.href = '/login';
  };

  
  return {
    token,         
    user,          
    authLoading,   
    login,         
    logout         
  };
}