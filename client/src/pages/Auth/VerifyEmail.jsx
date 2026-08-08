import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MailCheck, RefreshCw, ArrowRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Login.css';

const VerifyEmail = () => {
  const { resendVerificationEmail, user } = useContext(AuthContext);
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendVerificationEmail();
      toast.success('Verification email resent! Please check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="auth-page-container">
        <div className="auth-card glass-card text-center">
          <div className="verify-icon-wrapper">
            <MailCheck size={56} className="verify-icon" />
          </div>
          <h2>Verify Your Email</h2>
          <p className="verify-desc">
            We have sent a verification email to{' '}
            <strong>{user?.email || 'your registered address'}</strong>. Please click the link in your email to verify your account and activate full access.
          </p>

          <div className="verify-actions">
            <button 
              type="button" 
              className="btn btn-secondary w-full" 
              onClick={handleResend}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Resend Verification Email
            </button>
            <Link to="/login" className="btn btn-primary w-full mt-2">
              Proceed to Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
