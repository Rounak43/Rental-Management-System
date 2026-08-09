import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import Product from '../models/Product.js';
import Rental from '../models/Rental.js';
import User from '../models/User.js';
import VendorProfile from '../models/VendorProfile.js';

// Helper: delete a file from disk safely
const deleteFile = (filePath) => {
  if (!filePath) return;
  // filePath is like '/uploads/avatars/avatar-xxx.jpg'
  // Convert to a relative path from server root
  const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const absPath = path.resolve(relativePath);
  fs.unlink(absPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.warn('[deleteFile] Could not delete:', absPath, err.message);
    } else {
      console.log('[deleteFile] Deleted:', absPath);
    }
  });
};

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/dashboard
// @access  Private/Vendor
export const getVendorDashboard = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    const products = await Product.find({ owner: vendorId });
    const productIds = products.map((p) => p._id);

    const totalProducts = products.length;
    const publishedProducts = products.filter((p) => p.isPublished).length;
    const availableProducts = products.filter((p) => p.availability).length;

    const rentals = await Rental.find({ product: { $in: productIds } })
      .populate('user', 'name email')
      .populate('product', 'title pricePerDay images')
      .sort({ createdAt: -1 });

    const totalRentals = rentals.length;
    const activeRentals = rentals.filter((r) => r.status === 'active').length;
    const pendingRentals = rentals.filter((r) => r.status === 'pending').length;
    const completedRentals = rentals.filter((r) => r.status === 'returned').length;

    const totalRevenue = rentals
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.totalCost, 0);

    const recentRentals = rentals.slice(0, 5);

    res.status(200).json({
      stats: {
        totalProducts,
        publishedProducts,
        availableProducts,
        totalRentals,
        activeRentals,
        pendingRentals,
        completedRentals,
        totalRevenue,
      },
      recentRentals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor profile
// @route   GET /api/vendor/profile
// @access  Private/Vendor
export const getVendorProfile = async (req, res, next) => {
  try {
    let profile = await VendorProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await VendorProfile.create({
        user: req.user._id,
        companyName: `${req.user.name}'s Shop`,
        ownerName: req.user.name,
        gst: '',
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor profile (text fields)
// @route   PUT /api/vendor/profile
// @access  Private/Vendor
export const updateVendorProfile = async (req, res, next) => {
  try {
    const { companyName, ownerName, gst, businessAddress, rentalCategory, contactPhone, website } = req.body;

    let profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new VendorProfile({ user: req.user._id });
    }

    if (companyName) profile.companyName = companyName;
    if (ownerName) profile.ownerName = ownerName;
    if (gst !== undefined) profile.gst = gst;
    if (rentalCategory !== undefined) profile.rentalCategory = rentalCategory;
    if (contactPhone !== undefined) profile.contactPhone = contactPhone;
    if (website !== undefined) profile.website = website;
    if (businessAddress) {
      profile.businessAddress = { ...profile.businessAddress, ...businessAddress };
    }

    await profile.save();

    // Also sync ownerName to User.name if changed
    if (ownerName) {
      await User.findByIdAndUpdate(req.user._id, { name: ownerName });
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload vendor company logo
// @route   POST /api/vendor/upload-logo
// @access  Private/Vendor
export const uploadVendorLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const logoPath = `/uploads/avatars/${req.file.filename}`;

    let profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new VendorProfile({
        user: req.user._id,
        companyName: `${req.user.name}'s Shop`,
        ownerName: req.user.name,
      });
    }

    // Delete old logo file from disk before overwriting
    if (profile.logo) deleteFile(profile.logo);

    profile.logo = logoPath;
    await profile.save();

    res.status(200).json({ success: true, logo: logoPath, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload vendor owner profile photo
// @route   POST /api/vendor/upload-avatar
// @access  Private/Vendor
export const uploadVendorAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Delete old avatar file from disk before overwriting
    const existingUser = await User.findById(req.user._id);
    if (existingUser?.profileImage) deleteFile(existingUser.profileImage);

    await User.findByIdAndUpdate(req.user._id, { profileImage: avatarPath });

    res.status(200).json({ success: true, avatar: avatarPath });
  } catch (error) {
    next(error);
  }
};

// @desc    Change vendor password
// @route   PUT /api/vendor/change-password
// @access  Private/Vendor
export const changeVendorPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Password change not available for Google accounts' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
