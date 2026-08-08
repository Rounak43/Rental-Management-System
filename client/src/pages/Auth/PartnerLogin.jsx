import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Building, Lock, Mail, LogIn } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Login.css';

const PartnerLogin = () => {
  const { loginWithEmail, loginWithGoogle, user, clearStaleSession } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    clearStaleSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await loginWithEmail(email, password, 'vendor');
      toast.success(`Welcome Partner, ${loggedUser.name}!`);
      navigate('/partner/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Vendor login failed. Please check credentials.');
      toast.error(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await loginWithGoogle('vendor');
      toast.success(`Logged in as Vendor ${loggedUser.name}!`);
      navigate('/partner/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
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
              <div className="input-icon-wrapper">
                <Lock className="field-icon" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
            Google Vendor Sign In
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
