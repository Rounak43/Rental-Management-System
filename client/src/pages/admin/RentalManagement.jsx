import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

const RentalManagement = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h2>Rental Management</h2>
        <p>Placeholder displaying active rental lists, lease details, user assignments, and contract parameters.</p>
      </div>
    </div>
  );
};

export default RentalManagement;
