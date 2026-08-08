import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h4>Admin Panel</h4>
      </div>
      <ul className="sidebar-menu">
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
  
