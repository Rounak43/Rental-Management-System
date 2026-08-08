import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on mount and retrieve user profile
    const token = localStorage.getItem('token');
    if (token) {
      // Simulate retrieving user data
      setUser({ id: '1', name: 'Demo User', email: 'user@example.com', role: 'admin' });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Placeholder login logic
    localStorage.setItem('token', 'dummy-token');
    setUser({ id: '1', name: 'Demo User', email: 'user@example.com', role: 'admin' });
    return true;
  };

  const logout = () => {
    // Placeholder logout logic
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
