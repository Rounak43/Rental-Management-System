import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile, deleteUserAccount } from '../../services/profileService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  Building,
  User,
  Shield,
  Sliders,
  Bell,
  Lock,
  LogOut,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Globe,
  Camera
} from 'lucide-react';
import '../customer/CustomerSettings.css';

const VendorSettings = () => {
  const { user, setUser, firebaseUser, changePassword, logout, deleteAccount } = useContext(AuthContext);
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('company');

  // Company details
  const [companyData, setCompanyData] = useState({
    companyName: user?.vendorProfile?.companyName || user?.companyName || 'Apex Rental Machinery & Cameras',
    logo: user?.vendorProfile?.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    gst: user?.vendorProfile?.gst || '22AAAAA0000A1Z5',
    street: user?.vendorProfile?.businessAddress?.street || '450 Innovation Parkway',
    city: user?.vendorProfile?.businessAddress?.city || 'San Francisco',
    state: user?.vendorProfile?.businessAddress?.state || 'CA',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 890-1234',
    website: 'https://apexrentals.com',
  });

  // Owner profile details
  const [ownerData, setOwnerData] = useState({
    ownerName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    photo: user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  });

  // Password details
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    workingHours: '09:00 AM - 07:00 PM',
    rentalTime: 'Minimum 1 Day',
    deliveryRadius: '25 km',
    currency: 'USD ($)',
    timezone: 'UTC-8 (Pacific Time)',
  });

  // Notifications
  const [vendorNotifs, setVendorNotifs] = useState({
    booking: true,
    inventory: true,
    payments: true,
    emails: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateUserProfile({
        name: ownerData.ownerName,
        phone: ownerData.phone,
        companyName: companyData.companyName,
        gst: companyData.gst,
      });
      setUser((prev) => ({ ...prev, name: ownerData.ownerName }));
      toast.success('Vendor company profile updated!');
    } catch (err) {
      toast.error('Failed to update vendor settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      await changePassword(passwords.newPassword);
      toast.success('Vendor password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="settings-page-wrapper">
        <div className="settings-container">
          <div className="settings-header">
            <h2>Vendor Partner Settings</h2>
            <p>Configure company profile, preferences, payout notifications, and operational settings</p>
          </div>

          <div className="settings-layout">
            <aside className="settings-sidebar glass-card">
              <button
                className={`settings-nav-item ${activeTab === 'company' ? 'active' : ''}`}
                onClick={() => setActiveTab('company')}
              >
                <Building size={18} /> Company
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'owner' ? 'active' : ''}`}
                onClick={() => setActiveTab('owner')}
              >
                <User size={18} /> Vendor Profile
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <Lock size={18} /> Password
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                <Sliders size={18} /> Preferences
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} /> Notifications
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Shield size={18} /> Security & 2FA
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'danger' ? 'active' : ''}`}
                onClick={() => setActiveTab('danger')}
              >
                <Trash2 size={18} /> Danger Zone
              </button>
            </aside>

            <main className="settings-content glass-card">
              {/* Company Tab */}
              {activeTab === 'company' && (
                <form onSubmit={handleSaveCompany} className="settings-tab-pane">
                  <h3>Company & Business Profile</h3>

                  <div className="avatar-section">
                    <div className="avatar-wrapper">
                      <img src={companyData.logo} alt="Company Logo" className="profile-preview-avatar" />
                      <div className="avatar-overlay"><Camera size={20} /></div>
                    </div>
                    <div className="avatar-input-box">
                      <label>Company Logo URL</label>
                      <input
                        type="url"
                        value={companyData.logo}
                        onChange={(e) => setCompanyData({ ...companyData, logo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={companyData.companyName}
                        onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>GST / Tax ID Number</label>
                      <input
                        type="text"
                        value={companyData.gst}
                        onChange={(e) => setCompanyData({ ...companyData, gst: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Business Email</label>
                      <input type="email" value={companyData.email} disabled className="input-disabled" />
                    </div>
                    <div className="form-group">
                      <label>Business Phone</label>
                      <input
                        type="tel"
                        value={companyData.phone}
                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Street Address</label>
                      <input
                        type="text"
                        value={companyData.street}
                        onChange={(e) => setCompanyData({ ...companyData, street: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Website URL</label>
                      <input
                        type="url"
                        value={companyData.website}
                        onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Company Details'}
                  </button>
                </form>
              )}

              {/* Vendor Profile Tab */}
              {activeTab === 'owner' && (
                <form onSubmit={handleSaveCompany} className="settings-tab-pane">
                  <h3>Owner / Account Manager Profile</h3>

                  <div className="avatar-section">
                    <div className="avatar-wrapper">
                      <img src={ownerData.photo} alt="Owner" className="profile-preview-avatar" />
                      <div className="avatar-overlay"><Camera size={20} /></div>
                    </div>
                    <div className="avatar-input-box">
                      <label>Manager Photo URL</label>
                      <input
                        type="url"
                        value={ownerData.photo}
                        onChange={(e) => setOwnerData({ ...ownerData, photo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Owner / Manager Name</label>
                      <input
                        type="text"
                        value={ownerData.ownerName}
                        onChange={(e) => setOwnerData({ ...ownerData, ownerName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Direct Phone</label>
                      <input
                        type="tel"
                        value={ownerData.phone}
                        onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                    <Save size={18} /> Save Owner Profile
                  </button>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handleSavePassword} className="settings-tab-pane">
                  <h3>Security Password</h3>
                  <div className="form-group max-w-md">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group max-w-md">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group max-w-md">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                    <Lock size={18} /> Update Password
                  </button>
                </form>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="settings-tab-pane">
                  <h3>Business Operational Preferences</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label><Clock size={16} /> Working Hours</label>
                      <input
                        type="text"
                        value={preferences.workingHours}
                        onChange={(e) => setPreferences({ ...preferences, workingHours: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Rental Duration Unit</label>
                      <input
                        type="text"
                        value={preferences.rentalTime}
                        onChange={(e) => setPreferences({ ...preferences, rentalTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label><MapPin size={16} /> Delivery Radius</label>
                      <input
                        type="text"
                        value={preferences.deliveryRadius}
                        onChange={(e) => setPreferences({ ...preferences, deliveryRadius: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label><DollarSign size={16} /> Base Currency</label>
                      <input
                        type="text"
                        value={preferences.currency}
                        onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label><Globe size={16} /> Timezone</label>
                      <input
                        type="text"
                        value={preferences.timezone}
                        onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                      />
                    </div>
                  </div>

                  <button type="button" className="btn btn-primary mt-4" onClick={() => toast.success('Preferences saved!')}>
                    <Save size={18} /> Save Preferences
                  </button>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="settings-tab-pane">
                  <h3>Vendor Notification Controls</h3>
                  <div className="notification-list">
                    <div className="notification-toggle-item">
                      <div>
                        <h4>Booking Requests</h4>
                        <p>Alerts for new incoming rental booking orders</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={vendorNotifs.booking}
                          onChange={(e) => setVendorNotifs({ ...vendorNotifs, booking: e.target.checked })}
                        />
                        <span className="slider" />
                      </label>
                    </div>

                    <div className="notification-toggle-item">
                      <div>
                        <h4>Inventory Low-Stock & Overdue Return Alerts</h4>
                        <p>Receive notifications when rentals are late or inventory is low</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={vendorNotifs.inventory}
                          onChange={(e) => setVendorNotifs({ ...vendorNotifs, inventory: e.target.checked })}
                        />
                        <span className="slider" />
                      </label>
                    </div>

                    <div className="notification-toggle-item">
                      <div>
                        <h4>Payout & Security Deposit Confirmations</h4>
                        <p>Receive financial statements and deposit refund logs</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={vendorNotifs.payments}
                          onChange={(e) => setVendorNotifs({ ...vendorNotifs, payments: e.target.checked })}
                        />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security & 2FA Tab */}
              {activeTab === 'security' && (
                <div className="settings-tab-pane">
                  <h3>Security & Authentication</h3>
                  <div className="connected-card mb-4">
                    <div className="connected-info">
                      <img src={firebaseUser?.photoURL || ownerData.photo} alt="Google" className="connected-avatar" />
                      <div>
                        <h4>Google Partner Connection</h4>
                        <p>{user?.email}</p>
                        <span className="badge badge-success"><CheckCircle2 size={12} /> Connected</span>
                      </div>
                    </div>
                  </div>

                  <div className="setting-option-box">
                    <div className="option-label">
                      <Shield size={20} />
                      <div>
                        <h4>Two-Factor Authentication (2FA)</h4>
                        <p>SMS / Authenticator app code verification (Placeholder)</p>
                      </div>
                    </div>
                    <span className="badge badge-warning">Coming Soon</span>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              {activeTab === 'danger' && (
                <div className="settings-tab-pane">
                  <h3 className="text-danger">Partner Danger Zone</h3>
                  <div className="danger-box">
                    <div>
                      <h4>Log Out Partner Session</h4>
                      <p>Terminate active session</p>
                    </div>
                    <button onClick={() => { logout(); window.location.href = '/'; }} className="btn btn-secondary">
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>

                  <div className="danger-box mt-4">
                    <div>
                      <h4>Delete Vendor Account</h4>
                      <p>Remove vendor store, listings, and credentials</p>
                    </div>
                    <button onClick={() => toast.info('Contact Admin to delete vendor organization')} className="btn btn-danger">
                      <Trash2 size={16} /> Delete Partner Account
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VendorSettings;
