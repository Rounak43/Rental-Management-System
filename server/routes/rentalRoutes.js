import express from 'express';
import {
  createRental,
  getMyRentals,
  getAllRentals,
  updatePickupStatus,
  updateReturnStatus,
  getRentalReports,
} from '../controllers/rentalController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer rental endpoints
router.post('/', protect, createRental);
router.get('/my-rentals', protect, getMyRentals);

// Admin-only management endpoints
router.get('/', protect, admin, getAllRentals);
router.patch('/:id/pickup', protect, admin, updatePickupStatus);
router.patch('/:id/return', protect, admin, updateReturnStatus);
router.get('/reports/analytics', protect, admin, getRentalReports);

export default router;
