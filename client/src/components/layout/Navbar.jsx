import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar-header">
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">RentalSystem</Link>
        </div>
        <ul className="navbar-links">
          <li><Link to="/products">Browse</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
