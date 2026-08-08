import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h4>Admin Panel</h4>
      </div>
      <ul className="sidebar-menu">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/products">Manage Products</Link></li>
        <li><Link to="/admin/categories">Manage Categories</Link></li>
        <li><Link to="/admin/rentals">Manage Rentals</Link></li>
        <li><Link to="/admin/pickups">Pickups</Link></li>
        <li><Link to="/admin/returns">Returns</Link></li>
        <li><Link to="/admin/deposits">Security Deposits</Link></li>
        <li><Link to="/admin/late-fees">Late Fees</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
  
