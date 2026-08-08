import express from 'express';
import authRoutes from './authRoutes.js';

const router = express.Router();

// Mount sub-routers
router.use('/auth', authRoutes);

export default router;
