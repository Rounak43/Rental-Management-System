import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

const ProductManagement = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h2>Product Management</h2>
        <p>Placeholder for registering inventory items, modifying daily prices, security deposits, and upload actions.</p>
      </div>
    </div>
  );
};

export default ProductManagement;
