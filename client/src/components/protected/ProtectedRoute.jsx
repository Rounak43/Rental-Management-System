import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../common/Loader';

/**
 * ProtectedRoute — wraps a page requiring authentication.
 *
 * Props:
 *   children   — the page to render
 *   role       — 'customer' | 'vendor' | 'admin' (optional)
 *                If supplied, the user's role must match.
 *   adminOnly  — legacy flag; kept for backwards compatibility
 *   redirectTo — where to send unauthenticated users (default: /login)
 */
const ProtectedRoute = ({
  children,
  role,
  adminOnly = false,
  redirectTo = '/login',
}) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect to complete profile if phone is missing, except when already on `/complete-profile`
  if (!user.phone && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // Legacy adminOnly check
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Role-based check
  if (role && user.role !== role && user.role !== 'admin') {
    // Redirect vendor to their dashboard if they land on customer route
    if (user.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    // Redirect customer to their dashboard if they land on vendor route
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
