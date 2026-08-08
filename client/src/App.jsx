import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

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

// Protected Route Wrap
import ProtectedRoute from './components/protected/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Customer Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductBrowse />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Customer Routes */}
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Protected Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><Dashboard /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute adminOnly={true}><ProductManagement /></ProtectedRoute>} />
                <Route path="/admin/categories" element={<ProtectedRoute adminOnly={true}><CategoryManagement /></ProtectedRoute>} />
                <Route path="/admin/rentals" element={<ProtectedRoute adminOnly={true}><RentalManagement /></ProtectedRoute>} />
                <Route path="/admin/pickups" element={<ProtectedRoute adminOnly={true}><PickupManagement /></ProtectedRoute>} />
                <Route path="/admin/returns" element={<ProtectedRoute adminOnly={true}><ReturnManagement /></ProtectedRoute>} />
                <Route path="/admin/deposits" element={<ProtectedRoute adminOnly={true}><DepositManagement /></ProtectedRoute>} />
                <Route path="/admin/late-fees" element={<ProtectedRoute adminOnly={true}><LateFeeManagement /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
