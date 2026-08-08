import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const ProtectedLayout = () => {
  return (
    <div className="protected-layout-container">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="main-content-layout">
          <div className="page-content">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
