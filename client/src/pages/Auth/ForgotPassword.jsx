import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './Login.css';

const ForgotPassword = () => {
  const { resetPassword } = useContext(AuthContext);
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await resetPassword(email);
      setSentSuccess(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
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
            <h2>Reset Password</h2>
            <p>Enter your email to receive a password reset link</p>
          </div>

          {sentSuccess ? (
            <div className="reset-success-box">
              <CheckCircle2 size={48} className="success-icon" />
              <h3>Check Your Email</h3>
              <p>
                We have sent password reset instructions to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="btn btn-primary w-full mt-4">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {errorMsg && <div className="auth-alert alert-error">{errorMsg}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Registered Email</label>
                  <div className="input-icon-wrapper">
                    <Mail className="field-icon" size={18} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? 'Sending Instructions...' : <><KeyRound size={18} /> Send Reset Link</>}
                </button>
              </form>
            </>
          )}

          <p className="auth-footer-text">
            <Link to="/login" className="back-link">
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
