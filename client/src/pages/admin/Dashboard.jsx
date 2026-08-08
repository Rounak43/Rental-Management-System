import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard-container" style={{ padding: '1rem' }}>
      <h2>Welcome, {user?.name || 'User'}!</h2>
      <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
        Account Type: <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{user?.role?.toUpperCase()}</span>
      </p>

      {user?.role === 'vendor' && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--surface-color)' }}>
          <h3>Vendor Business Board</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            Monitor rental product performance, manage product listings, track pickup/return logistics, and review monthly rental invoicing reports.
          </p>
        </div>
      )}

      {user?.role === 'customer' && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--surface-color)' }}>
          <h3>Customer Hub</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            Search for rental equipment, track active orders and return status, manage security deposits, and update contact profiles.
          </p>
        </div>
      )}

      {user?.role === 'admin' && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--surface-color)' }}>
          <h3>System Administrator Panel</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            Monitor platform metrics, manage user verification audits, review category taxonomy, and resolve dispute cases.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
