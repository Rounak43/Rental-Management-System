import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/dashboard">RentSphere</Link>
        </div>
        <ul className="navbar-links">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li>
            <button 
              onClick={handleLogout} 
              className="navbar-logout-btn"
              style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', padding: 0 }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
