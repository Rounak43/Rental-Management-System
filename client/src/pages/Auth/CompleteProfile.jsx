import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../services/profileService';
import { Phone, MapPin, User, Camera, Save } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Login.css';

const CompleteProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'USA',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Phone Number is required.');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        profileImage: formData.profileImage,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      });

      // Update auth context state
      setUser((prevUser) => ({
        ...prevUser,
        name: formData.name,
        phone: formData.phone,
        profileImage: formData.profileImage,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      }));

      toast.success('Profile completed successfully!');
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('[CompleteProfile] error:', err);
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
      toast.error(err.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="auth-page-container" style={{ padding: '40px 16px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-card glass-card" style={{ maxWidth: '600px', width: '100%', padding: '32px' }}>
          <div className="auth-header text-center" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Complete Your Profile</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Please provide your contact number and delivery details to complete registration.</p>
          </div>

          {errorMsg && <div className="auth-alert alert-error" style={{ marginBottom: '20px' }}>{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-section-divider" style={{ margin: '16px 0', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personal Information</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Full Name *</label>
                <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                  <User className="field-icon" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Phone Number *</label>
                <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                  <Phone className="field-icon" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Profile Image URL</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <Camera className="field-icon" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="url"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="auth-section-divider" style={{ margin: '24px 0 16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Address</h4>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Street Address</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <MapPin className="field-icon" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="123 Main St, Apt 4"
                  style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="USA"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
              {loading ? 'Saving Profile...' : <><Save size={18} /> Save & Continue</>}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompleteProfile;
