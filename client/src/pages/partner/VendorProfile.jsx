import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VendorSidebar from '../../components/layout/VendorSidebar';
import { getVendorProfile, updateVendorProfile } from '../../services/vendorService';
import { useToast } from '../../context/ToastContext';
import { Building, Store, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

const VendorProfile = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: '',
    ownerName: '',
    gst: '',
    rentalCategory: 'Electronics & Tech',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getVendorProfile();
      if (data) {
        setProfileData({
          companyName: data.companyName || '',
          ownerName: data.ownerName || '',
          gst: data.gst || '',
          rentalCategory: data.rentalCategory || 'Electronics & Tech',
          businessAddress: {
            street: data.businessAddress?.street || '',
            city: data.businessAddress?.city || '',
            state: data.businessAddress?.state || '',
            zipCode: data.businessAddress?.zipCode || '',
            country: data.businessAddress?.country || 'India',
          }
        });
      }
    } catch (e) {
      toast.error('Failed to load business profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      businessAddress: {
        ...prev.businessAddress,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateVendorProfile(profileData);
      if (updated) {
        toast.success('Business profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        <VendorSidebar />
        
        <main style={{ flex: 1, padding: '32px', background: 'var(--bg-color)', overflowY: 'auto' }}>
          <div className="partner-dash-container" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <h2 style={{ margin: 0 }}>Business Profile</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Manage your organization details, GST tax configuration, and default storage addresses.
              </p>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Profile Card Summary */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                  <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 'bold', boxShadow: '0 8px 20px var(--primary-glow)' }}>
                    {profileData.companyName?.slice(0, 1).toUpperCase() || 'P'}
                  </div>
                  <div>
                    <h3 style={{ margin: '8px 0 4px 0' }}>{profileData.companyName || 'Elite Partner'}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,102,0,0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      Verified Equipment Vendor
                    </span>
                  </div>

                  <div style={{ width: '100%', borderTop: '1px solid var(--surface-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Building size={16} style={{ color: 'var(--primary-color)' }} />
                      <span>{profileData.ownerName || 'Owner Name'} (Owner)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Mail size={16} style={{ color: 'var(--primary-color)' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Phone size={16} style={{ color: 'var(--primary-color)' }} />
                      <span>{user?.phone || 'No phone registered'}</span>
                    </div>
                    {profileData.gst && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={16} style={{ color: 'var(--color-success)' }} />
                        <span>GSTIN: {profileData.gst}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Editor Card */}
                <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ margin: 0, borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>Organization Details</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label>Business / Company Name *</label>
                      <input 
                        type="text" 
                        name="companyName" 
                        value={profileData.companyName} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Owner Full Name *</label>
                      <input 
                        type="text" 
                        name="ownerName" 
                        value={profileData.ownerName} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>GST Registration ID (GSTIN)</label>
                      <input 
                        type="text" 
                        name="gst" 
                        placeholder="e.g. 29AAAAA1111A1Z1"
                        value={profileData.gst} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Primary Business Niche</label>
                      <select name="rentalCategory" value={profileData.rentalCategory} onChange={handleInputChange}>
                        <option value="Electronics & Tech">Electronics & Tech</option>
                        <option value="Vehicles">Vehicles</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Gym & Fitness">Gym & Fitness</option>
                        <option value="Apparel & Clothes">Apparel & Clothes</option>
                        <option value="Home & Furniture">Home & Furniture</option>
                        <option value="Tools & Hardware">Tools & Hardware</option>
                      </select>
                    </div>

                    {/* Address Section */}
                    <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                      <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} /> Physical Storage / Business Address
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label>Street Address</label>
                          <input 
                            type="text" 
                            name="street" 
                            placeholder="e.g. 45th Main, 2nd Phase"
                            value={profileData.businessAddress.street} 
                            onChange={handleAddressChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>City</label>
                          <input 
                            type="text" 
                            name="city" 
                            placeholder="Bangalore"
                            value={profileData.businessAddress.city} 
                            onChange={handleAddressChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>State</label>
                          <input 
                            type="text" 
                            name="state" 
                            placeholder="Karnataka"
                            value={profileData.businessAddress.state} 
                            onChange={handleAddressChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Pincode / Zip Code</label>
                          <input 
                            type="text" 
                            name="zipCode" 
                            placeholder="560001"
                            value={profileData.businessAddress.zipCode} 
                            onChange={handleAddressChange} 
                          />
                        </div>

                        <div className="form-group">
                          <label>Country</label>
                          <input 
                            type="text" 
                            name="country" 
                            value={profileData.businessAddress.country} 
                            onChange={handleAddressChange} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--surface-border)', paddingTop: '20px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving changes...' : 'Save Profile'}
                    </button>
                  </div>
                </form>

              </div>
            )}

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default VendorProfile;
