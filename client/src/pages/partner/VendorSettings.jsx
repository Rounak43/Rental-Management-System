import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VendorSidebar from '../../components/layout/VendorSidebar';
import {
  updateVendorProfile,
  uploadVendorLogo,
  uploadVendorAvatar,
  changeVendorPassword,
  getVendorProfile,
} from '../../services/vendorService';
import {
  Building,
  User,
  Sliders,
  Bell,
  Lock,
  LogOut,
  Trash2,
  Save,
  Clock,
  DollarSign,
  MapPin,
  Globe,
  Camera,
  Upload,
} from 'lucide-react';
import '../customer/CustomerSettings.css';

const API_BASE = 'http://localhost:5000';

const getUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  return `${API_BASE}${p.startsWith('/') ? '' : '/'}${p}`;
};

const VendorSettings = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Company details
  const [companyData, setCompanyData] = useState({
    companyName: '',
    gst: '',
    street: '',
    city: '',
    state: '',
    email: user?.email || '',
    phone: '',
    website: '',
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const logoInputRef = useRef(null);

  // Owner profile details
  const [ownerData, setOwnerData] = useState({
    ownerName: user?.name || '',
    phone: user?.phone || '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarInputRef = useRef(null);

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
    currency: 'INR (₹)',
    timezone: 'UTC+5:30 (IST)',
  });

  // Notifications
  const [vendorNotifs, setVendorNotifs] = useState({
    booking: true,
    inventory: true,
    payments: true,
  });

  // Load vendor profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getVendorProfile();
        setCompanyData({
          companyName: profile.companyName || '',
          gst: profile.gst || '',
          street: profile.businessAddress?.street || '',
          city: profile.businessAddress?.city || '',
          state: profile.businessAddress?.state || '',
          email: user?.email || '',
          phone: profile.contactPhone || user?.phone || '',
          website: profile.website || '',
        });
        setLogoPreview(getUrl(profile.logo));
        setOwnerData({
          ownerName: profile.ownerName || user?.name || '',
          phone: profile.contactPhone || '',
        });
        setAvatarPreview(getUrl(user?.profileImage));
        setProfileLoaded(true);
      } catch (e) {
        toast.error('Could not load vendor profile.');
      }
    };
    load();
  }, []);

  // ── Logo file select ──
  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // ── Avatar file select ──
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save Company ──
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Upload logo if a new file was selected
      let finalLogo = logoPreview;
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        const res = await uploadVendorLogo(fd);
        finalLogo = getUrl(res.logo);
        setLogoPreview(finalLogo);
        setLogoFile(null);
      }

      // 2. Save profile text fields
      const updated = await updateVendorProfile({
        companyName: companyData.companyName,
        gst: companyData.gst,
        contactPhone: companyData.phone,
        website: companyData.website,
        businessAddress: {
          street: companyData.street,
          city: companyData.city,
          state: companyData.state,
        },
      });

      // 3. Update context so sidebar refreshes
      setUser((prev) => ({
        ...prev,
        vendorProfile: { ...prev.vendorProfile, companyName: updated.companyName, logo: updated.logo },
      }));

      toast.success('Company profile saved!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save company profile.');
    } finally {
      setLoading(false);
    }
  };

  // ── Save Owner Profile ──
  const handleSaveOwner = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Upload avatar if new file selected
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const res = await uploadVendorAvatar(fd);
        setAvatarPreview(getUrl(res.avatar));
        setUser((prev) => ({ ...prev, profileImage: res.avatar }));
        setAvatarFile(null);
      }

      // 2. Save ownerName to vendor profile
      await updateVendorProfile({
        ownerName: ownerData.ownerName,
        contactPhone: ownerData.phone,
      });

      setUser((prev) => ({ ...prev, name: ownerData.ownerName }));
      toast.success('Owner profile saved!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save owner profile.');
    } finally {
      setLoading(false);
    }
  };

  // ── Change Password ──
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await changeVendorPassword(passwords.currentPassword, passwords.newPassword);
      toast.success('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const tabBtn = (tab, label, icon) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', borderRadius: '8px', border: 'none',
        background: activeTab === tab ? 'rgba(255,102,0,0.1)' : 'transparent',
        color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
        cursor: 'pointer', textAlign: 'left', fontWeight: '600', width: '100%',
        transition: 'all 0.2s',
      }}
    >
      {icon} {label}
    </button>
  );

  const dangerTabBtn = (tab, label, icon) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', borderRadius: '8px', border: 'none',
        background: activeTab === tab ? 'rgba(239,68,68,0.1)' : 'transparent',
        color: activeTab === tab ? '#ef4444' : 'var(--text-secondary)',
        cursor: 'pointer', textAlign: 'left', fontWeight: '600', width: '100%',
        transition: 'all 0.2s',
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="app-container">
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        <VendorSidebar />

        <main style={{ flex: 1, padding: '32px', background: 'var(--bg-color)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>

            <div>
              <h2 style={{ margin: 0 }}>Partner Settings</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Manage your company profile, password, preferences, and notifications.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>

              {/* Left nav */}
              <aside className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {tabBtn('company', 'Company Details', <Building size={16} />)}
                {tabBtn('owner', 'Owner Profile', <User size={16} />)}
                {tabBtn('password', 'Change Password', <Lock size={16} />)}
                {tabBtn('preferences', 'Preferences', <Sliders size={16} />)}
                {tabBtn('notifications', 'Notifications', <Bell size={16} />)}
                {dangerTabBtn('danger', 'Danger Zone', <Trash2 size={16} />)}
              </aside>

              {/* Right content */}
              <div className="glass-card" style={{ padding: '28px' }}>

                {/* ── COMPANY TAB ── */}
                {activeTab === 'company' && (
                  <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: 0 }}>Company & Business Profile</h3>

                    {/* Logo upload */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                        <img
                          src={logoPreview || 'https://via.placeholder.com/90?text=Logo'}
                          alt="Company Logo"
                          style={{ width: '90px', height: '90px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--surface-border)' }}
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          style={{
                            position: 'absolute', bottom: '-8px', right: '-8px',
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'var(--primary-color)', color: 'white',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Camera size={14} />
                        </button>
                        <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoFileChange} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '600' }}>Company Logo</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Click the camera icon to upload. Max 3MB, JPG/PNG/WebP.
                        </p>
                        <button type="button" onClick={() => logoInputRef.current?.click()} className="btn btn-secondary" style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.8rem' }}>
                          <Upload size={12} style={{ marginRight: '4px' }} /> Choose File
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label>Company Name *</label>
                        <input type="text" value={companyData.companyName} onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>GST / Tax ID</label>
                        <input type="text" value={companyData.gst} onChange={(e) => setCompanyData({ ...companyData, gst: e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label>Business Email (Read-only)</label>
                        <input type="email" value={companyData.email} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }} />
                      </div>
                      <div className="form-group">
                        <label>Contact Phone</label>
                        <input type="tel" value={companyData.phone} onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label>Street Address</label>
                        <input type="text" value={companyData.street} onChange={(e) => setCompanyData({ ...companyData, street: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>City</label>
                        <input type="text" value={companyData.city} onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input type="text" value={companyData.state} onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label><Globe size={14} style={{ marginRight: '4px' }} />Website URL</label>
                      <input type="url" value={companyData.website} placeholder="https://yourcompany.com" onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })} />
                    </div>

                    <div>
                      <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={16} /> {loading ? 'Saving...' : 'Save Company Profile'}
                      </button>
                    </div>
                  </form>
                )}

                {/* ── OWNER PROFILE TAB ── */}
                {activeTab === 'owner' && (
                  <form onSubmit={handleSaveOwner} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: 0 }}>Owner / Account Manager Profile</h3>

                    {/* Avatar upload */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                        <img
                          src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerData.ownerName || 'V')}&background=ff6600&color=fff&size=90`}
                          alt="Profile"
                          style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--surface-border)' }}
                        />
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          style={{
                            position: 'absolute', bottom: '-4px', right: '-4px',
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'var(--primary-color)', color: 'white',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Camera size={14} />
                        </button>
                        <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFileChange} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '600' }}>Profile Photo</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Click to upload your photo. Max 3MB.
                        </p>
                        <button type="button" onClick={() => avatarInputRef.current?.click()} className="btn btn-secondary" style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.8rem' }}>
                          <Upload size={12} style={{ marginRight: '4px' }} /> Choose Photo
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label>Owner / Manager Name *</label>
                        <input type="text" value={ownerData.ownerName} onChange={(e) => setOwnerData({ ...ownerData, ownerName: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Direct Phone</label>
                        <input type="tel" value={ownerData.phone} onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={16} /> {loading ? 'Saving...' : 'Save Owner Profile'}
                      </button>
                    </div>
                  </form>
                )}

                {/* ── PASSWORD TAB ── */}
                {activeTab === 'password' && (
                  <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: 0 }}>Change Password</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Update your account password. Must be at least 6 characters.
                    </p>

                    <div className="form-group" style={{ maxWidth: '420px' }}>
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        required
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="form-group" style={{ maxWidth: '420px' }}>
                      <label>New Password</label>
                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        required
                        placeholder="At least 6 characters"
                      />
                    </div>
                    <div className="form-group" style={{ maxWidth: '420px' }}>
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        required
                        placeholder="Repeat new password"
                      />
                    </div>

                    <div>
                      <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={16} /> {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                )}

                {/* ── PREFERENCES TAB ── */}
                {activeTab === 'preferences' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: 0 }}>Operational Preferences</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label><Clock size={14} style={{ marginRight: '4px' }} />Working Hours</label>
                        <input type="text" value={preferences.workingHours} onChange={(e) => setPreferences({ ...preferences, workingHours: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Minimum Rental Duration</label>
                        <input type="text" value={preferences.rentalTime} onChange={(e) => setPreferences({ ...preferences, rentalTime: e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label><MapPin size={14} style={{ marginRight: '4px' }} />Delivery Radius</label>
                        <input type="text" value={preferences.deliveryRadius} onChange={(e) => setPreferences({ ...preferences, deliveryRadius: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label><DollarSign size={14} style={{ marginRight: '4px' }} />Currency</label>
                        <input type="text" value={preferences.currency} onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label><Globe size={14} style={{ marginRight: '4px' }} />Timezone</label>
                        <input type="text" value={preferences.timezone} onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <button type="button" className="btn btn-primary" onClick={() => toast.success('Preferences saved!')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={16} /> Save Preferences
                      </button>
                    </div>
                  </div>
                )}

                {/* ── NOTIFICATIONS TAB ── */}
                {activeTab === 'notifications' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: 0 }}>Notification Preferences</h3>

                    {[
                      { key: 'booking', label: 'New Booking Requests', desc: 'Alert when a customer books your equipment' },
                      { key: 'inventory', label: 'Inventory & Late Returns', desc: 'Alerts for overdue rentals or low inventory' },
                      { key: 'payments', label: 'Payments & Deposits', desc: 'Financial statements and deposit confirmations' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--surface-border)', borderRadius: '12px' }}>
                        <div>
                          <h4 style={{ margin: 0 }}>{label}</h4>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={vendorNotifs[key]} onChange={(e) => setVendorNotifs({ ...vendorNotifs, [key]: e.target.checked })} />
                          <span className="slider" />
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── DANGER ZONE TAB ── */}
                {activeTab === 'danger' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, color: '#ef4444' }}>Danger Zone</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--surface-border)', borderRadius: '12px' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>Log Out</h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>End your current vendor session</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={async () => { await logout(); navigate('/login'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #ef4444', borderRadius: '12px', background: 'rgba(239,68,68,0.03)' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>Delete Vendor Account</h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Permanently removes your store and all listings</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => toast.info('Contact admin support to delete your vendor account.')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Trash2 size={16} /> Delete Account
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default VendorSettings;
