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
    const availableProducts = products.filter((p) => p.availability && (p.availableQuantity > 0)).length;

    const rentals = await Rental.find({ product: { $in: productIds } })
      .populate('user', 'name email phone')
      .populate('product', 'title pricePerDay images securityDeposit')
      .sort({ createdAt: -1 });

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const totalRentals = rentals.length;
    const activeRentals = rentals.filter((r) => r.status === 'active').length;
    const pendingRentals = rentals.filter((r) => r.status === 'pending').length;
    const completedRentals = rentals.filter((r) => r.status === 'returned').length;
    const lateRentals = rentals.filter((r) => r.status === 'overdue' || (r.status === 'active' && new Date(r.rentEndDate) < new Date())).length;

    const todayPickups = rentals.filter((r) => {
      const start = new Date(r.rentStartDate);
      return (start >= todayStart && start <= todayEnd) || (r.status === 'pending');
    }).length;

    const todayReturns = rentals.filter((r) => {
      const end = new Date(r.rentEndDate);
      return end >= todayStart && end <= todayEnd;
    }).length;

    const pendingReturns = rentals.filter((r) => r.status === 'active' || r.status === 'overdue').length;

    const totalRevenue = rentals
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.totalCost || 0), 0);

    const lateFeeRevenue = rentals
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.lateFee || 0), 0);

    const pendingRefunds = rentals
      .filter((r) => r.status === 'returned')
      .reduce((sum, r) => sum + (r.refundAmount || 0), 0);

    const returnedWithLate = rentals.filter(r => r.status === 'returned' && r.lateHours > 0);
    const averageReturnDelay = returnedWithLate.length > 0
      ? (returnedWithLate.reduce((sum, r) => sum + r.lateHours, 0) / returnedWithLate.length).toFixed(1)
      : 0;

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
        lateRentals,
        todayPickups,
        todayReturns,
        pendingReturns,
        totalRevenue,
        lateFeeRevenue,
        pendingRefunds,
        averageReturnDelay: Number(averageReturnDelay),
      },
      recentRentals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor analytics data for charts & reporting
// @route   GET /api/vendor/analytics
// @access  Private/Vendor
export const getVendorAnalytics = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    // Fetch all vendor products
    const products = await Product.find({ owner: vendorId }).populate('category', 'name');
    const productIds = products.map((p) => p._id);

    // Fetch all rentals for vendor products
    const rentals = await Rental.find({ product: { $in: productIds } })
      .populate('product', 'title category pricePerDay securityDeposit')
      .populate('user', 'name email phone')
      .sort({ createdAt: 1 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const activeRentalsList = rentals.filter(r => r.status !== 'cancelled');

    // Revenue Summaries
    const todayRevenue = activeRentalsList.filter(r => new Date(r.createdAt) >= todayStart).reduce((s, r) => s + (r.totalCost || 0), 0);
    const weeklyRevenue = activeRentalsList.filter(r => new Date(r.createdAt) >= weekAgo).reduce((s, r) => s + (r.totalCost || 0), 0);
    const monthlyRevenue = activeRentalsList.filter(r => new Date(r.createdAt) >= monthAgo).reduce((s, r) => s + (r.totalCost || 0), 0);
    const yearlyRevenue = activeRentalsList.filter(r => new Date(r.createdAt) >= yearAgo).reduce((s, r) => s + (r.totalCost || 0), 0);
    const totalRevenue = activeRentalsList.reduce((s, r) => s + (r.totalCost || 0), 0);

    const lateFeeEarned = rentals.reduce((s, r) => s + (r.lateFee || 0), 0);
    const refundAmount = rentals.reduce((s, r) => s + (r.refundAmount || 0), 0);
    const securityDepositHeld = rentals.filter(r => r.status === 'active' || r.status === 'pending').reduce((s, r) => s + (r.securityDepositPaid || 0), 0);

    const completedRentals = rentals.filter(r => r.status === 'returned').length;
    const cancelledRentals = rentals.filter(r => r.status === 'cancelled').length;
    const pendingPickups = rentals.filter(r => r.status === 'pending' || (r.status === 'active' && r.pickupStatus === 'pending')).length;
    const pendingReturns = rentals.filter(r => r.status === 'active' || r.status === 'overdue').length;

    const productsAvailable = products.filter(p => p.availability && p.availableQuantity > 0).length;
    const productsOutForRent = products.filter(p => (p.currentlyRented || 0) > 0).length;
    const outOfStockProducts = products.filter(p => p.availableQuantity === 0).length;

    // Monthly revenue & late fee trends (last 6 months)
    const monthlyDataMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short' });
      monthlyDataMap[key] = { month: label, revenue: 0, lateFees: 0, rentals: 0, completed: 0, cancelled: 0 };
    }

    rentals.forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyDataMap[key]) {
        if (r.status !== 'cancelled') {
          monthlyDataMap[key].revenue += (r.totalCost || 0);
          monthlyDataMap[key].lateFees += (r.lateFee || 0);
          monthlyDataMap[key].rentals += 1;
        }
        if (r.status === 'returned') monthlyDataMap[key].completed += 1;
        if (r.status === 'cancelled') monthlyDataMap[key].cancelled += 1;
      }
    });

    const monthlyTrends = Object.values(monthlyDataMap);

    // Product performance ranking
    const prodMap = {};
    rentals.forEach(r => {
      if (r.status === 'cancelled') return;
      const pId = r.product?._id?.toString() || 'unknown';
      const title = r.product?.title || 'Equipment Item';
      if (!prodMap[pId]) prodMap[pId] = { title, count: 0, revenue: 0 };
      prodMap[pId].count += 1;
      prodMap[pId].revenue += (r.totalCost || 0);
    });

    const topProducts = Object.values(prodMap).sort((a, b) => b.count - a.count).slice(0, 10);
    const topPerformingProduct = topProducts[0]?.title || 'None';
    const mostRentedProduct = topProducts[0]?.title || 'None';

    // Category distribution breakdown
    const catMap = {};
    products.forEach(p => {
      const cName = p.category?.name || 'Other';
      catMap[cName] = (catMap[cName] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(catMap).map(([name, count]) => ({ name, count }));

    // Customer Insights
    const custMap = {};
    rentals.forEach(r => {
      if (!r.user) return;
      const uId = r.user._id?.toString();
      if (!custMap[uId]) {
        custMap[uId] = { name: r.user.name, email: r.user.email, totalRentals: 0, revenue: 0, lateReturns: 0 };
      }
      custMap[uId].totalRentals += 1;
      custMap[uId].revenue += (r.totalCost || 0);
      if (r.lateHours > 0 || r.status === 'overdue') custMap[uId].lateReturns += 1;
    });

    const topCustomers = Object.values(custMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    res.status(200).json({
      cards: {
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        yearlyRevenue,
        totalRevenue,
        lateFeeEarned,
        refundAmount,
        securityDepositHeld,
        completedRentals,
        cancelledRentals,
        pendingPickups,
        pendingReturns,
        productsAvailable,
        productsOutForRent,
        outOfStockProducts,
        topPerformingProduct,
        mostRentedProduct,
      },
      monthlyTrends,
      topProducts,
      categoryBreakdown,
      topCustomers,
      totalRentals: rentals.length,
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
