import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

const DepositManagement = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h2>Security Deposit Management</h2>
        <p>Placeholder for reviewing paid security deposits, resolving damage disputes, and triggering credit card refunds.</p>
      </div>
    </div>
  );
};

export default DepositManagement;
