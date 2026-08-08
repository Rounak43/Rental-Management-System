import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchAllUsers,
  deleteUserAccount,
  bulkDeleteAllCustomerVendorAccounts
} from '../../services/userService';
import {
  Users,
  UserCheck,
  Store,
  Shield,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  X,
  UserPlus,
  LogOut
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalCustomers: 0, totalVendors: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [userToDelete, setUserToDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers({ role: roleFilter, search: searchQuery });
      setUsersList(data.users || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleDeleteSingleUser = async () => {
    if (!userToDelete) return;
    try {
      setActionLoading(true);
      await deleteUserAccount(userToDelete._id);
      showToast(`Account (${userToDelete.email}) deleted successfully`, 'success');
      setUserToDelete(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete user account', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setActionLoading(true);
      const res = await bulkDeleteAllCustomerVendorAccounts();
      showToast(res.message || 'All customer & vendor accounts deleted!', 'success');
      setShowBulkDeleteModal(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to perform bulk deletion', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Top Navigation / Header */}
      <header className="admin-header glass-card">
        <div className="admin-brand">
          <div className="brand-logo flex items-center gap-2">
            <Shield className="text-primary" size={28} />
            <h2>RentSphere <span className="badge-admin">Admin Control</span></h2>
          </div>
        </div>

        <div className="admin-user-info flex items-center gap-4">
          <div className="user-details">
            <span className="user-name">{user?.name || 'System Admin'}</span>
            <span className="user-email text-muted">{user?.email}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { logout(); window.location.href = '/'; }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-content mt-6 flex-col gap-6">
        
        {/* Banner & Quick Danger Action */}
        <div className="admin-banner glass-card flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1>Unified Account Management</h1>
            <p className="text-muted mt-1">
              Oversee all Customer and Vendor accounts across the entire platform in one place.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh List
            </button>
            <button 
              className="btn btn-danger flex items-center gap-2"
              onClick={() => setShowBulkDeleteModal(true)}
            >
              <Trash2 size={18} /> Delete All Customer & Vendor Accounts
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card glass-card">
            <div className="stat-icon icon-users">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total System Users</span>
              <h3 className="stat-value">{stats.totalUsers}</h3>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon icon-customers">
              <UserCheck size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Customers</span>
              <h3 className="stat-value">{stats.totalCustomers}</h3>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon icon-vendors">
              <Store size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Vendors</span>
              <h3 className="stat-value">{stats.totalVendors}</h3>
            </div>
          </div>
        </div>

        {/* User Directory Table Section */}
        <div className="admin-directory-section glass-card">
          
          {/* Controls Bar: Search & Role Filters */}
          <div className="directory-controls flex justify-between items-center flex-wrap gap-4 mb-4">
            
            <div className="role-tabs flex gap-2">
              <button 
                className={`tab-btn ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                All Users
              </button>
              <button 
                className={`tab-btn ${roleFilter === 'customer' ? 'active' : ''}`}
                onClick={() => setRoleFilter('customer')}
              >
                Customers ({stats.totalCustomers})
              </button>
              <button 
                className={`tab-btn ${roleFilter === 'vendor' ? 'active' : ''}`}
                onClick={() => setRoleFilter('vendor')}
              >
                Vendors ({stats.totalVendors})
              </button>
              <button 
                className={`tab-btn ${roleFilter === 'admin' ? 'active' : ''}`}
                onClick={() => setRoleFilter('admin')}
              >
                Admins
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="search-box flex items-center">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button type="button" className="clear-btn" onClick={() => { setSearchQuery(''); loadData(); }}>
                  <X size={16} />
                </button>
              )}
            </form>

          </div>

          {/* User Table */}
          {loading ? (
            <div className="text-center py-12 text-muted">
              <RefreshCw className="animate-spin inline-block mb-2" size={24} />
              <p>Loading accounts...</p>
            </div>
          ) : usersList.length === 0 ? (
            <div className="empty-state py-12 text-center">
              <Users size={48} className="mx-auto text-muted mb-3 opacity-50" />
              <h3>No Accounts Found</h3>
              <p className="text-muted mt-1">
                {roleFilter !== 'all' 
                  ? `There are currently 0 users registered with role '${roleFilter}'.`
                  : 'There are currently no accounts in the database.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar-circle">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-xs text-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`role-badge role-${u.role}`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="text-sm text-muted">
                        {u.phone || 'N/A'}
                      </td>

                      <td className="text-sm text-muted">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td>
                        <span className={`status-pill ${u.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="text-right">
                        <button
                          className="btn-icon btn-danger-icon"
                          title="Delete User Account"
                          onClick={() => setUserToDelete(u)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* Modal 1: Single User Delete Confirmation */}
      {userToDelete && (
        <div className="admin-modal-overlay" onClick={() => setUserToDelete(null)}>
          <div className="admin-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle size={24} />
                <h3>Confirm Account Deletion</h3>
              </div>
              <button className="close-btn" onClick={() => setUserToDelete(null)}><X size={20} /></button>
            </div>

            <div className="modal-body py-4">
              <p>Are you sure you want to permanently delete this user account?</p>
              <div className="user-preview-card mt-3">
                <div><strong>Name:</strong> {userToDelete.name}</div>
                <div><strong>Email:</strong> {userToDelete.email}</div>
                <div><strong>Role:</strong> <span className={`role-badge role-${userToDelete.role}`}>{userToDelete.role}</span></div>
              </div>
              <p className="text-xs text-danger mt-3">
                * This action is irreversible and will purge this account from the system.
              </p>
            </div>

            <div className="modal-footer flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setUserToDelete(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteSingleUser} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Customer & Vendor Delete Confirmation */}
      {showBulkDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => setShowBulkDeleteModal(false)}>
          <div className="admin-modal glass-card danger-border" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle size={28} />
                <h3>Danger Zone: Delete All Accounts</h3>
              </div>
              <button className="close-btn" onClick={() => setShowBulkDeleteModal(false)}><X size={20} /></button>
            </div>

            <div className="modal-body py-4">
              <p className="font-semibold text-lg text-white">
                You are about to delete ALL Customer and Vendor accounts from the database.
              </p>
              <p className="text-muted mt-2">
                This will wipe all customer profiles and vendor profiles from MongoDB. Admin accounts will not be deleted.
              </p>
              <div className="danger-alert-box mt-4">
                <strong>Warning:</strong> {stats.totalCustomers} Customer(s) and {stats.totalVendors} Vendor(s) will be permanently purged.
              </div>
            </div>

            <div className="modal-footer flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setShowBulkDeleteModal(false)} disabled={actionLoading}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleBulkDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting All Accounts...' : 'Yes, Delete All Customer & Vendor Accounts'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
