import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './PartnerLogin.css';

const PartnerLogin = () => {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'vendor') navigate('/partner/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const data = await login(formData.email, formData.password);

      if (data.role !== 'vendor' && data.role !== 'admin') {
        setServerError('This account is not a Rental Partner account. Please use Customer Login.');
        return;
      }

      navigate('/partner/dashboard', { replace: true });
    } catch (error) {
      setServerError(
        error.response?.data?.message || error.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="partner-login-page">

      {/* LEFT VISUAL */}
      <div className="partner-visual">
        <Link to="/" className="partner-visual-brand">
          <span className="partner-visual-brand-icon">R</span>
          RentSphere
        </Link>

        <div className="partner-visual-body">
          <h2>
            Partner<br />
            <span>Portal.</span>
          </h2>
          <p>
            Manage your product listings, track rental orders,
            and grow your rental business on RentSphere.
          </p>

          <div className="partner-visual-features">
            <div className="partner-feature">
              <div className="partner-feature-icon">📦</div>
              <div>
                <strong>Product Management</strong>
                <span>List and manage your rental inventory</span>
              </div>
            </div>
            <div className="partner-feature">
              <div className="partner-feature-icon">📊</div>
              <div>
                <strong>Revenue Analytics</strong>
                <span>Track earnings and rental performance</span>
              </div>
            </div>
            <div className="partner-feature">
              <div className="partner-feature-icon">🤝</div>
              <div>
                <strong>Customer Reach</strong>
                <span>Access thousands of verified customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="partner-form-panel">
        <div className="partner-login-card">

          {/* Brand (mobile) */}
          <div className="partner-login-brand">
            <Link to="/" className="partner-brand-link">
              <span className="partner-brand-icon">R</span>
              <span>RentSphere</span>
            </Link>
          </div>

          <div className="partner-login-header">
            <div className="partner-badge">RENTAL PARTNER</div>
            <h1>Partner Portal Login</h1>
            <p>Sign in to your business dashboard</p>
          </div>

          {serverError && (
            <div className="partner-server-error">
              {serverError}
            </div>
          )}

          <form className="partner-login-form" onSubmit={handleSubmit} noValidate>

            <div className="partner-form-group">
              <label htmlFor="partner-email">Business Email Address</label>
              <input
                id="partner-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="business@company.com"
                autoComplete="email"
                className={errors.email ? 'partner-input-error' : ''}
              />
              {errors.email && <span className="partner-field-error">{errors.email}</span>}
            </div>

            <div className="partner-form-group">
              <label htmlFor="partner-password">Password</label>
              <div className="partner-password-wrapper">
                <input
                  id="partner-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={errors.password ? 'partner-input-error' : ''}
                />
                <button
                  type="button"
                  className="partner-pw-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 10 8 10 8a17.4 17.4 0 0 1-3 4.2" />
                      <path d="M6.2 6.2C3.7 8.1 2 12 2 12s3 8 10 8a10.9 10.9 0 0 0 3.3-.5" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="partner-field-error">{errors.password}</span>}
            </div>

            <div className="partner-forgot-row">
              <Link to="/forgot-password" className="partner-forgot-link">Forgot Password?</Link>
            </div>

            <button type="submit" className="partner-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="partner-loader">
                  <span></span><span></span><span></span>
                </span>
              ) : 'Sign In to Partner Portal'}
            </button>
          </form>

          <div className="partner-register-row">
            <span>New rental partner?</span>
            <Link to="/register?type=vendor">Create Partner Account</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/login" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>
              Are you a Customer? <strong style={{ color: '#2563EB' }}>Login here →</strong>
            </Link>
          </div>

          <Link to="/" className="partner-back-home">← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;
