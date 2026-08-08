import express from 'express';
import {
  createRental,
  getMyRentals,
  getVendorRentals,
  getAllRentals,
  updatePickupStatus,
  updateReturnStatus,
  updateRentalStatus,
  getRentalReports,
} from '../controllers/rentalController.js';
import { protect, admin, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer rental endpoints
router.post('/', protect, createRental);
router.get('/my-rentals', protect, getMyRentals);

// Vendor rental endpoints
router.get('/vendor-rentals', protect, vendor, getVendorRentals);
router.patch('/:id/pickup', protect, vendor, updatePickupStatus);
router.patch('/:id/return', protect, vendor, updateReturnStatus);
router.patch('/:id/status', protect, vendor, updateRentalStatus);

// Admin-only management endpoints
router.get('/', protect, admin, getAllRentals);
router.get('/reports/analytics', protect, admin, getRentalReports);

export default router;
