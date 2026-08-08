import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

const LateFeeManagement = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h2>Late Fee Management</h2>
        <p>Placeholder showing overdue rentals, calculating outstanding penalty balances, and charging penalties.</p>
      </div>
    </div>
  );
};

export default LateFeeManagement;
