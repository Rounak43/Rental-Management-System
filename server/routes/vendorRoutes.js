import express from 'express';
import {
  getVendorDashboard,
  getVendorProfile,
  updateVendorProfile,
  uploadVendorLogo,
  uploadVendorAvatar,
  changeVendorPassword,
} from '../controllers/vendorController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';
import { avatarUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Vendor dashboard stats
router.get('/dashboard', protect, vendor, getVendorDashboard);

// Vendor profile management
router.get('/profile', protect, vendor, getVendorProfile);
router.put('/profile', protect, vendor, updateVendorProfile);

// File uploads
router.post('/upload-logo', protect, vendor, avatarUpload.single('logo'), uploadVendorLogo);
router.post('/upload-avatar', protect, vendor, avatarUpload.single('avatar'), uploadVendorAvatar);

// Password change
router.put('/change-password', protect, vendor, changeVendorPassword);

export default router;
