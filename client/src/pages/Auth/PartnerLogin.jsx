import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Building, Lock, Mail, LogIn, Eye, EyeOff } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import './Login.css';

const PartnerLogin = () => {
  const { loginWithEmail, loginWithGoogle, user, clearStaleSession } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await loginWithEmail(email, password, 'vendor');
      toast.success(`Welcome Partner, ${loggedUser.name}!`);
      navigate('/partner/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Vendor login failed. Please check credentials.';
      const isGoogleAccount = err?.response?.data?.authProvider === 'google' || msg.includes('Google Sign-In');
      if (isGoogleAccount) {
        setErrorMsg('This account uses Google Sign-In. Please use the button below.');
        toast.error('Please use the "Continue with Google" button.');
      } else {
        setErrorMsg(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await loginWithGoogle();
      toast.success(`Welcome Partner, ${loggedUser.name}!`);
      
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'vendor') {
        navigate('/partner/dashboard');
      } else {
        // Customer who used the vendor login portal — redirect to customer dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed.');
      toast.error(err.message || 'Google sign-in error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <main className="auth-page-container">
        <div className="auth-card glass-card">
          <div className="auth-header text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-3 no-underline">
              <span className="text-2xl font-black text-white tracking-tight">Rent<span className="text-primary">Sphere</span></span>
            </Link>
            <div className="vendor-badge-icon mx-auto mb-2">
              <Building size={28} color="#6366f1" />
            </div>
            <h2>Partner & Vendor Portal</h2>
            <p>Sign in to manage inventory, track rental bookings, and view earnings</p>
          </div>

          {errorMsg && <div className="auth-alert alert-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Vendor Business Email</label>
              <div className="input-icon-wrapper">
                <Mail className="field-icon" size={18} />
                <input
                  type="email"
                  placeholder="vendor@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-link">
                <label>Password</label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="input-icon-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock className="field-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '40px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 10,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Signing In...' : <><LogIn size={18} /> Log In as Partner</>}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR GOOGLE LOGIN</span>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary google-btn w-full" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer-text">
            Not a partner yet? <Link to="/register">Register as Vendor</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PartnerLogin;
