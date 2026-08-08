import React, { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Loader from './components/common/Loader';

// ── Public pages (eager loaded)
import Landing from './pages/Landing';
import ChooseAccount from './pages/ChooseAccount';

// ── Auth pages (eager — small)
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import PartnerLogin from './pages/Auth/PartnerLogin';

// ── Protected pages (lazy)
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const PartnerDashboard = lazy(() => import('./pages/partner/PartnerDashboard'));

// ── Lightweight protected route
const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loader />;
  if (!user) {
    return <Navigate to={requiredRole === 'vendor' ? '/partner/login' : '/login'} replace />;
  }
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to={user.role === 'vendor' ? '/partner/dashboard' : '/dashboard'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>

        {/* ── Public Routes ── */}
        <Route path="/" element={<Landing />} />
        <Route path="/choose-account" element={<ChooseAccount />} />

        {/* ── Auth Routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/partner/login" element={<PartnerLogin />} />

        {/* Legacy alias */}
        <Route path="/signup" element={<Navigate to="/register" replace />} />

        {/* ── Customer Protected Routes ── */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRole="customer">
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        {/* ── Partner Protected Routes ── */}
        <Route
          path="/partner/dashboard"
          element={
            <PrivateRoute requiredRole="vendor">
              <PartnerDashboard />
            </PrivateRoute>
          }
        />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;