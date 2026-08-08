import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { Eye, EyeOff, Lock, Mail, Phone, User, Check, X } from 'lucide-react';
import './Signup.css';

const Register = () => {
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password checklist state
  const [passwordMetrics, setPasswordMetrics] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  // Track password strength level
  const [strengthLevel, setStrengthLevel] = useState('weak');

  // Monitor password value to update checklist and strength bar
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

    // Calculate score
    const passedCount = Object.values(metrics).filter(Boolean).length;
    if (passedCount <= 2) {
      setStrengthLevel('weak');
    } else if (passedCount <= 4) {
      setStrengthLevel('medium');
    } else {
      setStrengthLevel('strong');
    }
  }, [formData.password]);

  // Handle field alterations
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset individual inline errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  // Perform full validation check
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,15}$/;

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

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

    // Verify password metrics
    const failedRequirements = Object.entries(passwordMetrics).filter(([_, passed]) => !passed);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');

    try {
      await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone,
        formData.password
      );
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <div className="auth-brand">
            <span>🔑</span> RentalMarket
          </div>
          <h2>Create Account</h2>
          <p>Sign up to start renting products today</p>
        </div>

        {serverError && (
          <div className="auth-alert-error">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
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
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? <span className="spinner-inline">Creating Account...</span> : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
