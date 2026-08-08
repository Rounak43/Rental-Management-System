import express from 'express';
import {
  processPayment,
  getPayments,
  refundDeposit,
  getVendorPayments,
} from '../controllers/paymentController.js';
import { protect, admin, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer payment endpoints
router.post('/process', protect, processPayment);

// Vendor billing monitoring endpoints
router.get('/vendor', protect, vendor, getVendorPayments);

// Admin billing monitoring endpoints
router.get('/', protect, admin, getPayments);
router.post('/:id/refund-deposit', protect, admin, refundDeposit);

export default router;
