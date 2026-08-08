import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

const PickupManagement = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h2>Pickup Management</h2>
        <p>Placeholder for tracking products awaiting customer pickup, checking verification codes, and changing status to 'active'.</p>
      </div>
    </div>
  );
};

export default PickupManagement;
