import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { getStoredWishlist } from '../../services/wishlistService';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Sun, 
  Moon, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Package, 
  ChevronDown, 
  Store 
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { calculateTotals } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // If user is not logged in, DO NOT render the Navbar on login/auth pages
  if (!user) {
    return null;
  }

  const isVendor = user.role === 'vendor';
  const cartTotals = calculateTotals();
  const wishlistCount = getStoredWishlist().length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to={isVendor ? "/partner/dashboard" : "/dashboard"} className="navbar-brand">
          <div className="brand-icon">
            <ShoppingBag size={22} color="#fff" />
          </div>
          <span className="brand-title">Rent<span className="brand-accent">Sphere</span></span>
        </Link>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={isVendor ? "Search store products, orders..." : "Search electronics, cameras, tools, equipment..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Navigation Actions */}
        <nav className="navbar-actions">
          {/* Theme Toggle */}
          <button 
            className="icon-btn theme-toggle" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Browse Products / Store */}
          <Link to="/products" className="nav-link">
            {isVendor ? 'Marketplace' : 'Browse'}
          </Link>

          {/* Wishlist & Cart Icons — ONLY SHOW FOR CUSTOMERS (HIDE FOR VENDORS) */}
          {!isVendor && (
            <>
              <Link to="/wishlist" className="icon-btn action-badge-btn" title="Wishlist">
                <Heart size={20} />
                {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
              </Link>

              <Link to="/cart" className="icon-btn action-badge-btn" title="Cart">
                <ShoppingBag size={20} />
                {cartTotals.itemCount > 0 && <span className="action-badge">{cartTotals.itemCount}</span>}
              </Link>
            </>
          )}

          {/* Logged in User Menu */}
          <div className="user-dropdown-container">
            <button 
              className="user-profile-btn" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img 
                src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                alt={user.name} 
                className="user-avatar"
              />
              <span className="user-name">{user.name}</span>
              <ChevronDown size={14} />
            </button>

            {showUserMenu && (
              <div className="dropdown-menu glass-card">
                <div className="menu-header">
                  <p className="menu-user-name">{user.name}</p>
                  <p className="menu-user-email">{user.email}</p>
                  <span className={`badge ${isVendor ? 'badge-warning' : 'badge-info'}`}>
                    {user.role ? user.role.toUpperCase() : 'CUSTOMER'}
                  </span>
                </div>
                <div className="menu-divider" />
                
                {isVendor ? (
                  <>
                    <Link to="/partner/dashboard" className="menu-item" onClick={() => setShowUserMenu(false)}>
                      <LayoutDashboard size={16} /> Partner Dashboard
                    </Link>
                    <Link to="/partner/products" className="menu-item" onClick={() => setShowUserMenu(false)}>
                      <Package size={16} /> Product Management
                    </Link>
                    <Link to="/partner/orders" className="menu-item" onClick={() => setShowUserMenu(false)}>
                      <Store size={16} /> Rental Orders
                    </Link>
                    <Link to="/partner/settings" className="menu-item" onClick={() => setShowUserMenu(false)}>
                      <Settings size={16} /> Vendor Settings
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="menu-item" onClick={() => setShowUserMenu(false)}>
                      <LayoutDashboard size={16} /> Customer Dashboard
                    </Link>
                    <Link to="/orders" className="menu-item" onClick={() => setShowUserMenu(false)}>
                      <Package size={16} /> My Rental Orders
                    </Link>
                    <Link to="/settings" className="menu-item" onClick={() => setShowUserMenu(false)}>
                      <Settings size={16} /> Account Settings
                    </Link>
                  </>
                )}

                <div className="menu-divider" />
                <button className="menu-item menu-logout" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
