import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Public Landing & Selection Pages
import Landing from './pages/Landing';
import ChooseAccount from './pages/ChooseAccount';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Protected Pages
import Dashboard from './pages/admin/Dashboard';

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
              <Route path="/" element={<Landing />} />
              <Route path="/choose-account" element={<ChooseAccount />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Register />} />

              {/* Protected Routes (Authenticated Customer, Vendor & Admin) */}
              <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
