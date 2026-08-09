import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getVendorProfile } from '../../services/vendorService';
import {
  LayoutDashboard,
  Package,
  CalendarRange,
  TrendingUp,
  Building,
  Settings,
  ShoppingBag,
  LogOut,
} from 'lucide-react';
import './Sidebar.css';

import getImageUrl from '../../utils/imageUrl';

const VendorSidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');

  useEffect(() => {
    getVendorProfile()
      .then((profile) => {
        setCompanyName(profile.companyName || user?.name || 'Partner Account');
        setCompanyLogo(getImageUrl(profile.logo));
      })
      .catch(() => {
        setCompanyName(user?.name || 'Partner Account');
      });
  }, [user]);


  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const linkStyle = {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', borderRadius: '8px',
    color: 'var(--text-color)', textDecoration: 'none',
    transition: 'all 0.2s', fontWeight: '500',
  };

  return (
    <aside
      className="vendor-sidebar glass-card"
      style={{
        width: '260px', padding: '24px 16px',
        display: 'flex', flexDirection: 'column',
        height: 'calc(100vh - 80px)', position: 'sticky',
        top: '80px', gap: '20px',
      }}
    >
      {/* Company branding header */}
      <div style={{ padding: '0 8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {companyLogo ? (
          <img
            src={companyLogo}
            alt="Company Logo"
            style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', border: '2px solid var(--surface-border)', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'var(--primary-gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0,
          }}>
            {(companyName || 'V').charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ overflow: 'hidden' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
            Vendor Control
          </p>
          <span style={{
            fontSize: '0.95rem', fontWeight: 'bold',
            color: 'var(--primary-color)', display: 'block',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {companyName || 'Partner Account'}
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <NavLink to="/partner/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <LayoutDashboard size={18} /><span>Dashboard</span>
        </NavLink>
        <NavLink to="/partner/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <Package size={18} /><span>My Products</span>
        </NavLink>
        <NavLink to="/partner/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <CalendarRange size={18} /><span>Rental Orders</span>
        </NavLink>
        <NavLink to="/partner/revenue" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <TrendingUp size={18} /><span>Revenue & Analytics</span>
        </NavLink>
        <NavLink to="/partner/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <Building size={18} /><span>Business Profile</span>
        </NavLink>
        <NavLink to="/partner/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <Settings size={18} /><span>Settings</span>
        </NavLink>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ ...linkStyle, color: 'var(--color-danger)', border: 'none', background: 'none', width: '100%', cursor: 'pointer', fontSize: 'inherit' }}
        >
          <LogOut size={18} /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default VendorSidebar;
