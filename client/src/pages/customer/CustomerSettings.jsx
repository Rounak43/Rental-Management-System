import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile, deleteUserAccount } from '../../services/profileService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  User,
  Shield,
  Link as LinkIcon,
  Bell,
  Palette,
  Trash2,
  Save,
  CheckCircle2,
  LogOut,
  Moon,
  Sun,
  Globe,
  Lock,
  Camera
} from 'lucide-react';
import './CustomerSettings.css';

const CustomerSettings = () => {
  const { user, setUser, firebaseUser, changePassword, logout, deleteAccount } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'USA',
  });

  // Password Form state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: true,
    rental: true,
    order: true,
    offers: false,
  });

  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);

  // Profile update handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile({
        name: profileData.name,
        phone: profileData.phone,
        profileImage: profileData.profileImage,
        address: {
          street: profileData.street,
          city: profileData.city,
          state: profileData.state,
          zipCode: profileData.zipCode,
          country: profileData.country,
        },
      });

      setUser((prev) => ({ ...prev, ...profileData }));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Password update handler
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await changePassword(passwords.newPassword);
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      try {
        if (user?._id) {
          await deleteUserAccount(user._id);
        }
        await deleteAccount();
        toast.info('Account deleted.');
      } catch (err) {
        toast.error('Failed to delete account.');
      }
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="settings-page-wrapper">
        <div className="settings-container">
          <div className="settings-header">
            <h2>Account Settings</h2>
            <p>Manage your profile info, security credentials, preferences, and connected accounts</p>
          </div>

          <div className="settings-layout">
            {/* Sidebar Navigation Tabs */}
            <aside className="settings-sidebar glass-card">
              <button
                className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} /> Profile
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Shield size={18} /> Security
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'connected' ? 'active' : ''}`}
                onClick={() => setActiveTab('connected')}
              >
                <LinkIcon size={18} /> Connected Account
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} /> Notifications
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <Palette size={18} /> Appearance
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <Trash2 size={18} /> Danger Zone
              </button>
            </aside>

            {/* Content Body */}
            <main className="settings-content glass-card">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="settings-tab-pane">
                  <h3>Personal Profile Details</h3>

                  {/* Avatar Upload Preview */}
                  <div className="avatar-section">
                    <div className="avatar-wrapper">
                      <img src={profileData.profileImage} alt="Profile" className="profile-preview-avatar" />
                      <div className="avatar-overlay">
                        <Camera size={20} />
                      </div>
                    </div>
                    <div className="avatar-input-box">
                      <label>Profile Image URL</label>
                      <input
                        type="url"
                        value={profileData.profileImage}
                        onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" value={profileData.email} disabled className="input-disabled" />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className="form-group">
                      <label>Street Address</label>
                      <input
                        type="text"
                        value={profileData.street}
                        onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                        placeholder="123 Main St, Apt 4"
                      />
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        placeholder="New York"
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        placeholder="NY"
                      />
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input
                        type="text"
                        value={profileData.zipCode}
                        onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handleSavePassword} className="settings-tab-pane">
                  <h3>Change Password</h3>
                  <p className="tab-desc">Update your password via Firebase Auth security provider</p>

                  <div className="form-group max-w-md">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="form-group max-w-md">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="form-group max-w-md">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                    <Lock size={18} /> {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}

              {/* Connected Account Tab */}
              {activeTab === 'connected' && (
                <div className="settings-tab-pane">
                  <h3>Connected Accounts</h3>
                  <p className="tab-desc">Linked social & OAuth providers for instant sign in</p>

                  <div className="connected-card">
                    <div className="connected-info">
                      <img
                        src={firebaseUser?.photoURL || user?.profileImage || 'https://lh3.googleusercontent.com/a/default-user=s96-c'}
                        alt="Google Account"
                        className="connected-avatar"
                      />
                      <div>
                        <h4>Google Account</h4>
                        <p>{firebaseUser?.email || user?.email}</p>
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Connected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="settings-tab-pane">
                  <h3>Notification Preferences</h3>
                  <p className="tab-desc">Choose which alerts you wish to receive</p>

                  <div className="notification-list">
                    <div className="notification-toggle-item">
                      <div>
                        <h4>Email Notifications</h4>
                        <p>Receive rental updates and invoice copies</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                        />
                        <span className="slider" />
                      </label>
                    </div>

                    <div className="notification-toggle-item">
                      <div>
                        <h4>Rental Reminders</h4>
                        <p>Get notified when rental return date is approaching</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.rental}
                          onChange={(e) => setNotifications({ ...notifications, rental: e.target.checked })}
                        />
                        <span className="slider" />
                      </label>
                    </div>

                    <div className="notification-toggle-item">
                      <div>
                        <h4>Order & Delivery Alerts</h4>
                        <p>Receive real-time delivery status updates</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.order}
                          onChange={(e) => setNotifications({ ...notifications, order: e.target.checked })}
                        />
                        <span className="slider" />
                      </label>
                    </div>

                    <div className="notification-toggle-item">
                      <div>
                        <h4>Special Offers & Discounts</h4>
                        <p>Be the first to hear about promotional equipment rates</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.offers}
                          onChange={(e) => setNotifications({ ...notifications, offers: e.target.checked })}
                        />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="settings-tab-pane">
                  <h3>Appearance & Language</h3>

                  <div className="setting-option-box">
                    <div className="option-label">
                      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                      <div>
                        <h4>Dark Mode</h4>
                        <p>Currently active: {theme.toUpperCase()}</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                      <span className="slider" />
                    </label>
                  </div>

                  <div className="setting-option-box mt-4">
                    <div className="option-label">
                      <Globe size={20} />
                      <div>
                        <h4>Preferred Language</h4>
                        <p>Select display language for portal</p>
                      </div>
                    </div>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="English">English (US)</option>
                      <option value="Spanish">Español</option>
                      <option value="French">Français</option>
                      <option value="German">Deutsch</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'account' && (
                <div className="settings-tab-pane">
                  <h3 className="text-danger">Account Danger Zone</h3>
                  <p className="tab-desc">Irreversible account actions and session teardown</p>

                  <div className="danger-box">
                    <div>
                      <h4>Sign Out of Session</h4>
                      <p>Clear active token and log out of all active devices</p>
                    </div>
                    <button onClick={() => { logout(); window.location.href = '/'; }} className="btn btn-secondary">
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>

                  <div className="danger-box mt-4">
                    <div>
                      <h4>Delete Customer Account</h4>
                      <p>Permanently remove account, bookings, and stored credentials</p>
                    </div>
                    <button onClick={handleDeleteAccount} className="btn btn-danger">
                      <Trash2 size={16} /> Delete Account
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

export default CustomerSettings;
