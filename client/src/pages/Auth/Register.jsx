import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import './Signup.css';

const Register = () => {
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get('type') === 'vendor' ? 'vendor' : 'customer';

  const [activeTab, setActiveTab] = useState(initialType);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Vendor specific
    companyName: '',
    ownerName: '',
    gst: '',
    rentalCategory: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password metrics
  const [passwordMetrics, setPasswordMetrics] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [strengthLevel, setStrengthLevel] = useState('weak');

  // Sync tab choice if URL changes
  useEffect(() => {
    const type = queryParams.get('type');
    if (type === 'vendor' || type === 'customer') {
      setActiveTab(type);
    }
  }, [location.search]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Password checker
  useEffect(() => {
    const pw = formData.password;
    const metrics = {
      length: pw.length >= 8,
      uppercase: /[A-Z]/.test(pw),
      lowercase: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      specialChar: /[^A-Za-z0-9]/.test(pw),
    };
    setPasswordMetrics(metrics);

    const passedCount = Object.values(metrics).filter(Boolean).length;
    if (passedCount <= 2) {
      setStrengthLevel('weak');
    } else if (passedCount <= 4) {
      setStrengthLevel('medium');
    } else {
      setStrengthLevel('strong');
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,15}$/;

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[\s-()]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    // Password validations
    const failedRequirements = Object.values(passwordMetrics).filter(p => !p);
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (failedRequirements.length > 0) {
      newErrors.password = 'Password does not meet strength requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-based details checks
    if (activeTab === 'customer') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
    } else if (activeTab === 'vendor') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = 'Owner/Representative name is required';
      }
      if (!formData.street.trim()) {
        newErrors.street = 'Street address is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
      }
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'Zip/Postal code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');

    try {
      if (activeTab === 'customer') {
        await register({
          role: 'customer',
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
      } else {
        await register({
          role: 'vendor',
          ownerName: formData.ownerName,
          companyName: formData.companyName,
          gst: formData.gst,
          rentalCategory: formData.rentalCategory,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          businessAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setServerError(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      ownerName: '',
      gst: '',
      rentalCategory: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    });
    setErrors({});
    setServerError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <div className="auth-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span>🌐</span> RentSphere
          </div>
          <h2>Create Account</h2>
          <p>Sign up to start renting on RentSphere</p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: '600',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'customer' ? '3px solid var(--primary-color)' : 'none',
              color: activeTab === 'customer' ? 'var(--primary-color)' : 'var(--text-secondary)',
            }}
            onClick={() => switchTab('customer')}
          >
            Customer Signup
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: '600',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'vendor' ? '3px solid var(--primary-color)' : 'none',
              color: activeTab === 'vendor' ? 'var(--primary-color)' : 'var(--text-secondary)',
            }}
            onClick={() => switchTab('vendor')}
          >
            Vendor Signup
          </button>
        </div>

        {serverError && (
          <div className="auth-alert-error">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {activeTab === 'customer' ? (
            /* Customer Fields */
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={errors.firstName ? 'input-error' : ''}
                />
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={errors.lastName ? 'input-error' : ''}
                />
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </div>
          ) : (
            /* Vendor Fields */
            <>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Rentals Co."
                    className={errors.companyName ? 'input-error' : ''}
                  />
                  {errors.companyName && <span className="field-error">{errors.companyName}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="ownerName">Owner Name</label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={errors.ownerName ? 'input-error' : ''}
                  />
                  {errors.ownerName && <span className="field-error">{errors.ownerName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="gst">GST Number (Optional)</label>
                  <input
                    type="text"
                    id="gst"
                    name="gst"
                    value={formData.gst}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="rentalCategory">Rental Category</label>
                  <select
                    id="rentalCategory"
                    name="rentalCategory"
                    value={formData.rentalCategory}
                    onChange={handleChange}
                    style={{ width: '100%', height: '42px', padding: '0 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-color)' }}
                  >
                    <option value="">Select a Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Tools">Tools</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>
              </div>

              {/* Business Address Group */}
              <div style={{ margin: '0.5rem 0', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Business Address</h4>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="123 Business St."
                    className={errors.street ? 'input-error' : ''}
                  />
                  {errors.street && <span className="field-error">{errors.street}</span>}
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="New York"
                      className={errors.city ? 'input-error' : ''}
                    />
                    {errors.city && <span className="field-error">{errors.city}</span>}
                  </div>
                  <div className="input-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="NY"
                      className={errors.state ? 'input-error' : ''}
                    />
                    {errors.state && <span className="field-error">{errors.state}</span>}
                  </div>
                </div>
                <div className="form-row" style={{ marginTop: '1rem' }}>
                  <div className="input-group">
                    <label htmlFor="zipCode">Zip/Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="10001"
                      className={errors.zipCode ? 'input-error' : ''}
                    />
                    {errors.zipCode && <span className="field-error">{errors.zipCode}</span>}
                  </div>
                  <div className="input-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Shared Contact/Password Fields */}
          <div className="input-group">
            <label htmlFor="email">
              {activeTab === 'vendor' ? 'Business Email Address' : 'Email Address'}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={activeTab === 'vendor' ? 'business@company.com' : 'you@example.com'}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="1234567890"
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}

            {formData.password && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div className={`password-strength-fill strength-${strengthLevel}`}></div>
                </div>
                <div className="password-strength-text">
                  Strength: {strengthLevel.toUpperCase()}
                </div>
                <div className="password-requirements">
                  <div className={`requirement-item ${passwordMetrics.length ? 'valid' : 'invalid'}`}>
                    {passwordMetrics.length ? <Check size={12} /> : <X size={12} />} At least 8 chars
                  </div>
                  <div className={`requirement-item ${passwordMetrics.uppercase ? 'valid' : 'invalid'}`}>
                    {passwordMetrics.uppercase ? <Check size={12} /> : <X size={12} />} Uppercase letter
                  </div>
                  <div className={`requirement-item ${passwordMetrics.lowercase ? 'valid' : 'invalid'}`}>
                    {passwordMetrics.lowercase ? <Check size={12} /> : <X size={12} />} Lowercase letter
                  </div>
                  <div className={`requirement-item ${passwordMetrics.number ? 'valid' : 'invalid'}`}>
                    {passwordMetrics.number ? <Check size={12} /> : <X size={12} />} Number digit
                  </div>
                  <div className={`requirement-item ${passwordMetrics.specialChar ? 'valid' : 'invalid'}`}>
                    {passwordMetrics.specialChar ? <Check size={12} /> : <X size={12} />} Special symbol
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Registering Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to={`/login?type=${activeTab}`}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
