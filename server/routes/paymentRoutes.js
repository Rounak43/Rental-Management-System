import express from 'express';
import {
  processPayment,
  getPayments,
  refundDeposit,
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer payment endpoints
router.post('/process', protect, processPayment);

// Admin billing monitoring endpoints
router.get('/', protect, admin, getPayments);
router.post('/:id/refund-deposit', protect, admin, refundDeposit);

export default router;
