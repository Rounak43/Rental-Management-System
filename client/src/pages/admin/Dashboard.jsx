import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

const Dashboard = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h2>Admin Dashboard</h2>
        <p>Placeholder showing quick stats (revenue, products rented, overdue count) and analytics graphs.</p>
      </div>
    </div>
  );
};

export default Dashboard;
