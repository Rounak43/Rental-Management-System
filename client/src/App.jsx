import React, { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Loader from './components/common/Loader';

// ── Public pages (eager loaded)
import Landing from './pages/Landing';
import ChooseAccount from './pages/ChooseAccount';

// ── Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import PartnerLogin from './pages/Auth/PartnerLogin';
import ForgotPassword from './pages/Auth/ForgotPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';

// ── Customer & Catalog pages (lazy loaded)
const ProductBrowse = lazy(() => import('./pages/customer/ProductBrowse'));
const ProductDetails = lazy(() => import('./pages/customer/ProductDetails'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const CheckoutFlow = lazy(() => import('./pages/customer/CheckoutFlow'));
const PaymentSuccess = lazy(() => import('./pages/customer/PaymentSuccess'));
const Orders = lazy(() => import('./pages/customer/Orders'));
const Wishlist = lazy(() => import('./pages/customer/Wishlist'));
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const CustomerSettings = lazy(() => import('./pages/customer/CustomerSettings'));

// ── Vendor / Partner pages (lazy loaded)
const PartnerDashboard = lazy(() => import('./pages/partner/PartnerDashboard'));
const VendorSettings = lazy(() => import('./pages/partner/VendorSettings'));
const PartnerProducts = lazy(() => import('./pages/partner/PartnerProducts'));
const PartnerOrders = lazy(() => import('./pages/partner/PartnerOrders'));

// ── Admin pages (lazy loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));


// ── Protected Route Guard
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />

        {/* ── Product Catalog & Shopping ── */}
        <Route path="/products" element={<ProductBrowse />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* ── Customer Protected Routes ── */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRole="customer">
              <CustomerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute requiredRole="customer">
              <CustomerSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute requiredRole="customer">
              <CheckoutFlow />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-success"
          element={
            <PrivateRoute requiredRole="customer">
              <PaymentSuccess />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute requiredRole="customer">
              <Orders />
            </PrivateRoute>
          }
        />

        {/* ── Partner / Vendor Protected Routes ── */}
        <Route
          path="/partner/dashboard"
          element={
            <PrivateRoute requiredRole="vendor">
              <PartnerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/partner/settings"
          element={
            <PrivateRoute requiredRole="vendor">
              <VendorSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/partner/products"
          element={
            <PrivateRoute requiredRole="vendor">
              <PartnerProducts />
            </PrivateRoute>
          }
        />
        <Route
          path="/partner/orders"
          element={
            <PrivateRoute requiredRole="vendor">
              <PartnerOrders />
            </PrivateRoute>
          }
        />

        {/* ── Admin Unified Dashboard Protected Route ── */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />


        {/* ── Fallback Route ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;