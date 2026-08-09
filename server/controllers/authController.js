import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import VendorProfile from '../models/VendorProfile.js';
import { generateToken } from '../utils/helpers.js';
import { getAuth } from 'firebase-admin/auth';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      role,
      companyName,
      ownerName,
      gst,
      rentalCategory,
      businessAddress
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === 'vendor' ? 'vendor' : 'customer';
    const finalName = userRole === 'vendor' ? (ownerName || name) : name;

    if (!finalName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Create user
    const user = await User.create({
      name: finalName,
      email: cleanEmail,
      password: hashedPassword,
      phone,
      role: userRole,
    });

    if (user) {
      let vendorProfile = null;

      // If user is registered as a vendor, create profile
      if (userRole === 'vendor') {
        if (!companyName) {
          // Rollback user creation
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({ message: 'Company name is required for vendor signup' });
        }

        vendorProfile = await VendorProfile.create({
          user: user._id,
          companyName,
          ownerName: finalName,
          gst: gst || '',
          rentalCategory: rentalCategory || '',
          businessAddress: businessAddress || {},
        });
      }

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id),
        vendorProfile,
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log(`[Login] Attempt for: ${cleanEmail}`);

    // Find user — use lean:false so we get a real Mongoose doc
    // We must NOT use .select('+password') because password has no select:false in schema
    // Instead we verify _doc has password directly
    const user = await User.findOne({ email: cleanEmail });

    // Step 1 — User not found
    if (!user) {
      console.log(`[Login] FAIL — No user found with email: ${cleanEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[Login] User found: ${user._id} | role: ${user.role} | authProvider: ${user.authProvider} | hasPassword: ${!!user._doc?.password}`);

    // Step 2 — User exists but was created via Google (no password stored)
    if (!user._doc?.password && user.authProvider === 'google') {
      console.log(`[Login] FAIL — Google-only account, no password set`);
      return res.status(401).json({
        message: 'This account was created with Google Sign-In. Please use the "Continue with Google" button to log in.',
        authProvider: 'google',
      });
    }

    // Step 3 — User has no password at all (edge case)
    if (!user._doc?.password) {
      console.log(`[Login] FAIL — No password stored for user`);
      return res.status(401).json({ message: 'Invalid credentials. Please reset your password or use Google sign-in.' });
    }

    // Step 4 — Compare passwords
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user._doc.password);
      console.log(`[Login] bcrypt.compare result: ${isMatch}`);
    } catch (bcryptErr) {
      console.error(`[Login] bcrypt.compare threw:`, bcryptErr.message);
      return res.status(500).json({ message: 'Authentication error. Please try again.' });
    }

    if (!isMatch) {
      console.log(`[Login] FAIL — Password mismatch for ${cleanEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Step 5 — Success
    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ user: user._id });
    }

    console.log(`[Login] SUCCESS — ${cleanEmail} (${user.role})`);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      token: generateToken(user._id),
      vendorProfile,
    });
  } catch (error) {
    console.error(`[Login] Unexpected error:`, error.message);
    next(error);
  }
};


// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user data missing' });
    }

    let vendorProfile = null;

    if (req.user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ user: req.user._id });
    }

    return res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      vendorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Authentication (Signup or Login automatically)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Firebase ID Token is required' });
    }

    // Verify token using Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (verifyError) {
      console.error('[GoogleAuth] Firebase token verification failed:', verifyError.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired Firebase ID Token' });
    }

    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account is missing an email address' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Step 1: Find user by email
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // CASE 1: User does not exist -> Create new account
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        firebaseUid: uid,
        profileImage: picture || '',
        role: 'customer', // default role
        authProvider: 'google',
        emailVerified: email_verified || true,
        lastLogin: new Date(),
      });

      console.log(`[GoogleAuth] Created new Google user: ${cleanEmail}`);
    } else {
      // CASE 2: User already exists
      // If user exists and doesn't have firebaseUid (e.g. they registered via email/password previously)
      // or if authProvider is not google, link it.
      let isUpdated = false;

      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        isUpdated = true;
      }

      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        isUpdated = true;
      }

      if (picture && user.profileImage !== picture) {
        user.profileImage = picture;
        isUpdated = true;
      }

      // Always update lastLogin
      user.lastLogin = new Date();
      isUpdated = true;

      if (isUpdated) {
        await user.save();
      }

      console.log(`[GoogleAuth] Logged in existing user: ${cleanEmail}`);
    }

    // Generate JWT token (exactly like standard login)
    const token = generateToken(user._id);

    // Retrieve vendor profile if user is a vendor
    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Login Successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        firebaseUid: user.firebaseUid,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        vendorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};
