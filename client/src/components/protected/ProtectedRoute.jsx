import React from 'react';
import { Navigate } from 'react-router-dom';
// Simulating hook or Context usage for Auth state
// import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  // Placeholder authentication state
  const isAuthenticated = true; // Set to true by default for navigation testing
  const userRole = 'admin'; // 'customer' or 'admin'

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
