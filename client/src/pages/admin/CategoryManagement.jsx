import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

const CategoryManagement = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h2>Category Management</h2>
        <p>Placeholder for categorizing products, editing labels, and listing existing classifications.</p>
      </div>
    </div>
  );
};

export default CategoryManagement;
