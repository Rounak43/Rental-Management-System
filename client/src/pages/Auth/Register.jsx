import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, User as UserIcon, Phone, Building, UserPlus } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Login.css';

const Register = () => {
  const { signupWithEmail, loginWithGoogle, user, clearStaleSession } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [roleTab, setRoleTab] = useState('customer'); // customer or vendor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    gst: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    clearStaleSession();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (roleTab === 'vendor' && !formData.companyName) {
      setErrorMsg('Company Name is required for Vendor registration.');
      return;
    }

    try {
      setLoading(true);
      const res = await signupWithEmail({
        ...formData,
        role: roleTab,
      });

      toast.success('Account created successfully! Verification email sent.');
      if (res.requiresVerification) {
        navigate('/verify-email');
      } else {
        navigate(roleTab === 'vendor' ? '/partner/dashboard' : '/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      toast.error(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await loginWithGoogle(roleTab);
      toast.success(`Registered with Google as ${loggedUser.name}!`);
      navigate(loggedUser.role === 'vendor' ? '/partner/dashboard' : '/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Google registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="auth-page-container">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <h2>Create Your Account</h2>
            <p>Join the rental network as a customer or partner vendor</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`role-tab ${roleTab === 'customer' ? 'active' : ''}`}
              onClick={() => setRoleTab('customer')}
            >
              <UserIcon size={16} /> Customer Account
            </button>
            <button
              type="button"
              className={`role-tab ${roleTab === 'vendor' ? 'active' : ''}`}
              onClick={() => setRoleTab('vendor')}
            >
              <Building size={16} /> Equipment Vendor
            </button>
          </div>

          {errorMsg && <div className="auth-alert alert-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{roleTab === 'vendor' ? 'Owner / Contact Name' : 'Full Name'} *</label>
              <div className="input-icon-wrapper">
                <UserIcon className="field-icon" size={18} />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-icon-wrapper">
                <Mail className="field-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div className="input-icon-wrapper">
                <Lock className="field-icon" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-icon-wrapper">
                <Phone className="field-icon" size={18} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {roleTab === 'vendor' && (
              <>
                <div className="form-group">
                  <label>Company / Agency Name *</label>
                  <div className="input-icon-wrapper">
                    <Building className="field-icon" size={18} />
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Apex Camera Rentals Ltd"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>GST / Tax Registration Number</label>
                  <input
                    type="text"
                    name="gst"
                    placeholder="22AAAAA0000A1Z5"
                    value={formData.gst}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating Account...' : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR REGISTER WITH</span>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary google-btn w-full" 
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google Sign Up
          </button>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
