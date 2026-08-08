import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'vendor') navigate('/partner/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
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

      // Role-based redirect
      if (data.role === 'vendor') {
        navigate('/partner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message || error.message || 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ── LEFT VISUAL PANEL ── */}
      <div className="login-visual">
        <Link to="/" className="login-visual-brand">
          <span className="login-visual-brand-icon">R</span>
          RentSphere
        </Link>

        <div className="login-visual-body">
          <h2>
            Welcome<br />
            <span>back.</span>
          </h2>
          <p>
            Sign in to your RentSphere customer account and start
            renting products from verified rental partners today.
          </p>
          <div className="login-visual-stats">
            <div className="login-visual-stat">
              <strong>10K+</strong>
              <span>Rentals completed</span>
            </div>
            <div className="login-visual-divider" />
            <div className="login-visual-stat">
              <strong>500+</strong>
              <span>Verified vendors</span>
            </div>
            <div className="login-visual-divider" />
            <div className="login-visual-stat">
              <strong>850+</strong>
              <span>Products listed</span>
            </div>
          </div>
        </div>

        <div className="login-float-card login-float-one">
          <div className="login-float-card-icon">🔑</div>
          <div className="login-float-card-text">
            <strong>Secure Login</strong>
            <span>Your data is protected</span>
          </div>
        </div>
        <div className="login-float-card login-float-two">
          <div className="login-float-card-icon">✅</div>
          <div className="login-float-card-text">
            <strong>Verified Vendors</strong>
            <span>Trusted marketplace</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="login-form-panel">
        <div className="login-card">

          {/* Brand (mobile) */}
          <div className="login-brand">
            <Link to="/" className="login-brand-link">
              <span className="login-brand-icon">R</span>
              <span>RentSphere</span>
            </Link>
          </div>

          {/* Header */}
          <div className="login-header">
            <h1>Customer Login</h1>
            <p>Sign in to browse and rent products</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#dc2626',
              fontSize: '14px',
            }}>
              {serverError}
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={errors.password ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
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
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" name="remember" checked={formData.remember} onChange={handleChange} />
                <span className="custom-checkbox"></span>
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? (
                <span className="button-loader">
                  <span></span><span></span><span></span>
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="login-register">
            <span>Don't have an account?</span>
            <Link to="/register?type=customer">Register Here</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link
              to="/partner/login"
              style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}
            >
              Are you a Rental Partner? <strong style={{ color: 'var(--orange)' }}>Login here →</strong>
            </Link>
          </div>

          <Link to="/" className="back-home">← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;