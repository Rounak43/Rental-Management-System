import express from 'express';
import {
  updateUserProfile,
  getAllUsers,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User profile self-management
router.put('/profile', protect, updateUserProfile);

// Admin-only user directory controls
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);

export default router;
