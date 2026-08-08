import express from 'express';
import { getVendorDashboard } from '../controllers/vendorController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Vendor dashboard stats
router.get('/dashboard', protect, vendor, getVendorDashboard);

export default router;
