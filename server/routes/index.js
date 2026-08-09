import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import rentalRoutes from './rentalRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import userRoutes from './userRoutes.js';
import vendorRoutes from './vendorRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = express.Router();

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/rentals', rentalRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/vendor', vendorRoutes);
router.use('/settings', settingsRoutes);

export default router;
