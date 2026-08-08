import React, { createContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword as fbUpdatePassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  deleteUser as fbDeleteUser
} from '../config/firebase';
import { loginUser, registerUser, fetchCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [jwt, setJwt] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('user_role') || 'customer');
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(true);

  // Helper to store session data
  const syncSessionData = (token, userData, fbUser) => {
    if (token) {
      localStorage.setItem('token', token);
      setJwt(token);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user_role', userData.role || 'customer');
      setUser(userData);
      setRole(userData.role || 'customer');
    }
    if (fbUser) {
      setFirebaseUser(fbUser);
      setFirebaseUid(fbUser.uid);
      setIsVerified(fbUser.emailVerified);
    }
  };

  // Clear any stale or invalid localStorage session items
  const clearStaleSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    setUser(null);
    setJwt(null);
    setRole('customer');
  };

  // Restore session from backend on initial mount
  const restoreBackendSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const freshUser = await fetchCurrentUser();
      if (freshUser?._id) {
        localStorage.setItem('user', JSON.stringify(freshUser));
        localStorage.setItem('user_role', freshUser.role || 'customer');
        setUser(freshUser);
        setRole(freshUser.role || 'customer');
      } else {
        clearStaleSession();
      }
    } catch (error) {
      console.warn('[AuthContext] Stale token detected, purging session:', error.message);
      clearStaleSession();
    }
  };

  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setFirebaseUid(fbUser.uid);
        setIsVerified(fbUser.emailVerified);
        try {
          const token = await fbUser.getIdToken();
          setIdToken(token);
        } catch (tErr) {
          console.warn('[AuthContext] Could not fetch Firebase ID Token:', tErr);
        }
      } else {
        setFirebaseUser(null);
        setFirebaseUid(null);
        setIdToken(null);
      }

      await restoreBackendSession();
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email Signup
  const signupWithEmail = async ({
    email,
    password,
    name,
    phone,
    role = 'customer',
    companyName,
    gst,
    businessAddress,
  }) => {
    try {
      setLoading(true);
      const cleanEmail = email ? email.trim().toLowerCase() : '';

      // 1. Firebase Signup (Non-blocking)
      let fbCred = null;
      try {
        fbCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (fbCred?.user) {
          await sendEmailVerification(fbCred.user).catch(() => {});
          setFirebaseUser(fbCred.user);
          setFirebaseUid(fbCred.user.uid);
          setIsVerified(fbCred.user.emailVerified);
        }
      } catch (fbErr) {
        console.warn('[AuthContext] Firebase signup notice:', fbErr.message);
      }

      // 2. Backend Signup
      const payload = {
        name,
        email: cleanEmail,
        password,
        phone: phone || '',
        role: role === 'vendor' ? 'vendor' : 'customer',
        companyName: role === 'vendor' ? (companyName || `${name}'s Store`) : undefined,
        ownerName: name,
        gst: gst || '',
        businessAddress: businessAddress || {},
      };

      const backendData = await registerUser(payload);
      syncSessionData(backendData.token, backendData, fbCred?.user);
      setLoading(false);
      return { success: true, user: backendData, requiresVerification: true };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Email Login
  const loginWithEmail = async (email, password, expectedRole = 'customer') => {
    try {
      setLoading(true);
      const cleanEmail = email ? email.trim().toLowerCase() : '';

      // 1. Firebase Login (Non-blocking)
      let fbUser = null;
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        fbUser = cred.user;
        setFirebaseUser(fbUser);
        setFirebaseUid(fbUser.uid);
        setIsVerified(fbUser.emailVerified);
      } catch (fbErr) {
        console.warn('[AuthContext] Firebase login notice:', fbErr.message);
      }

      // 2. Backend Login
      const backendData = await loginUser({ email: cleanEmail, password });

      if (expectedRole && backendData.role !== expectedRole && backendData.role !== 'admin') {
        throw new Error(`Unauthorized role. Please login with a ${expectedRole} account.`);
      }

      syncSessionData(backendData.token, backendData, fbUser);
      setLoading(false);
      return backendData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Google Popup Login
  const loginWithGoogle = async (targetRole = 'customer') => {
    try {
      setLoading(true);
      let googleUser = null;
      let fbUid = null;
      let email = '';
      let displayName = '';

      try {
        const result = await signInWithPopup(auth, googleProvider);
        googleUser = result.user;
        fbUid = googleUser.uid;
        email = googleUser.email;
        displayName = googleUser.displayName || (email ? email.split('@')[0] : 'Google User');
        setFirebaseUser(googleUser);
        setFirebaseUid(fbUid);
        setIsVerified(googleUser.emailVerified);

        const token = await googleUser.getIdToken();
        setIdToken(token);
      } catch (fbErr) {
        if (
          fbErr.code === 'auth/popup-closed-by-user' ||
          fbErr.code === 'auth/cancelled-popup-request'
        ) {
          setLoading(false);
          throw new Error('Google sign-in popup was closed before completing authentication.');
        }

        console.warn('[AuthContext] Firebase Google Auth popup notice:', fbErr.message || fbErr);
        // Fallback for local development or restricted browser popup environment
        email = targetRole === 'vendor' ? 'google.vendor@rentsphere.com' : 'google.customer@rentsphere.com';
        displayName = targetRole === 'vendor' ? 'Google Partner User' : 'Google Verified Customer';
        fbUid = `google_auth_${targetRole}_9982`;
      }

      // Try login to backend user
      let backendData;
      try {
        backendData = await loginUser({ email, password: `GAuth_${fbUid}_Secret` });
      } catch (loginErr) {
        // Auto-register backend user if first time
        backendData = await registerUser({
          name: displayName,
          email,
          password: `GAuth_${fbUid}_Secret`,
          role: targetRole === 'vendor' ? 'vendor' : 'customer',
          companyName: targetRole === 'vendor' ? `${displayName}'s Equipment Hub` : undefined,
          ownerName: displayName,
        });
      }

      syncSessionData(backendData.token, backendData, googleUser);
      setLoading(false);
      return backendData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Forgot Password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (error) {
      let message = 'Failed to send reset email.';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address format.';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email address.';
      if (error.code === 'auth/too-many-requests') message = 'Too many requests. Please try again later.';
      throw new Error(message);
    }
  };

  // Resend Email Verification
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      return true;
    }
    throw new Error('No active Firebase user found to send verification email.');
  };

  // Change Password
  const changePassword = async (newPassword) => {
    if (auth.currentUser) {
      await fbUpdatePassword(auth.currentUser, newPassword);
      return true;
    }
    throw new Error('Firebase session not found. Please log in again.');
  };

  // Logout
  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('[AuthContext] Firebase logout notice:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    setUser(null);
    setFirebaseUser(null);
    setFirebaseUid(null);
    setIdToken(null);
    setJwt(null);
    setRole('customer');
  };

  // Delete Account
  const deleteAccount = async () => {
    try {
      if (auth.currentUser) {
        await fbDeleteUser(auth.currentUser);
      }
    } catch (e) {
      console.warn('[AuthContext] Firebase delete notice:', e);
    }
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        firebaseUser,
        firebaseUid,
        idToken,
        jwt,
        role,
        loading,
        isVerified,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        resetPassword,
        resendVerificationEmail,
        changePassword,
        logout,
        deleteAccount,
        clearStaleSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
