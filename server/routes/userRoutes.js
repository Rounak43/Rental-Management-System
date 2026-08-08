import express from 'express';
import {
  updateUserProfile,
  getAllUsers,
  deleteUser,
  bulkDeleteAccounts,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User profile self-management
router.put('/profile', protect, updateUserProfile);

// Bulk delete all customer & vendor accounts (Admin only)
router.delete('/bulk/delete-all', protect, admin, bulkDeleteAccounts);

// Admin-only user directory controls
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, deleteUser);

export default router;
