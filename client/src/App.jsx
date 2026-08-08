import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Customer Pages
import Home from './pages/customer/Home';
import ProductBrowse from './pages/customer/ProductBrowse';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import Profile from './pages/customer/Profile';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import RentalManagement from './pages/admin/RentalManagement';
import PickupManagement from './pages/admin/PickupManagement';
import ReturnManagement from './pages/admin/ReturnManagement';
import DepositManagement from './pages/admin/DepositManagement';
import LateFeeManagement from './pages/admin/LateFeeManagement';

// Protected Route Wrap & Layout
import ProtectedRoute from './components/protected/ProtectedRoute';
import ProtectedLayout from './layouts/ProtectedLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app-container">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Register />} />

              {/* Protected Routes (Authenticated Customer & Admin) */}
              <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/browse" element={<ProductBrowse />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin Sub-routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/products" element={<ProductManagement />} />
                <Route path="/admin/categories" element={<CategoryManagement />} />
                <Route path="/admin/rentals" element={<RentalManagement />} />
                <Route path="/admin/pickups" element={<PickupManagement />} />
                <Route path="/admin/returns" element={<ReturnManagement />} />
                <Route path="/admin/deposits" element={<DepositManagement />} />
                <Route path="/admin/late-fees" element={<LateFeeManagement />} />
              </Route>
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
