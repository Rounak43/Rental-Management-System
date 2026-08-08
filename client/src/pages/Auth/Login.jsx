import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Read role selection from query params ?type=vendor
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get('type') === 'vendor' ? 'vendor' : 'customer';

  const [activeTab, setActiveTab] = useState(initialType);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!formData.email) {
      newErrors.email = activeTab === 'vendor' ? 'Business email is required' : 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
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

    setLoading(true);
    setServerError('');

    try {
      const data = await login(formData.email, formData.password);

      // Verify role alignment
      if (activeTab === 'vendor' && data.role !== 'vendor') {
        logout(); // Force session clean
        setServerError('This account is not registered as a Vendor. Please sign in under the Customer tab.');
        setLoading(false);
        return;
      }

      if (activeTab === 'customer' && data.role === 'vendor') {
        logout();
        setServerError('This is a Vendor account. Please sign in under the Vendor tab.');
        setLoading(false);
        return;
      }

      if (rememberMe && activeTab === 'customer') {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setServerError(error.response?.data?.message || error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFormData({ email: '', password: '' });
    setErrors({});
    setServerError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span>🌐</span> RentSphere
          </div>
          <h2>Welcome Back</h2>
          <p>Please select your login type</p>
        </div>

        {/* Tab selection */}
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
            Customer Login
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
            Vendor Login
          </button>
        </div>

        {serverError && (
          <div className="auth-alert-error">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
              placeholder={activeTab === 'vendor' ? 'info@company.com' : 'you@example.com'}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
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
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-options">
            {activeTab === 'customer' ? (
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
            ) : (
              <div />
            )}
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link to={`/choose-account`}>Register Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
