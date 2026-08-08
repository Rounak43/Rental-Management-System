import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh user data from API
          const freshUser = await fetchCurrentUser();
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUser(freshUser);
        } catch (error) {
          console.error('Failed to restore authentication session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      
      localStorage.setItem('token', data.token);
      
      // Store user details (excluding token)
      const { token, ...userData } = data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await registerUser(userData);
      
      localStorage.setItem('token', data.token);
      
      const { token, ...profileData } = data;
      localStorage.setItem('user', JSON.stringify(profileData));
      setUser(profileData);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
