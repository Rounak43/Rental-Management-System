import express from 'express';
import {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from '../controllers/productController.js';
import { protect, admin, vendor } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Vendor - own product management
router.get('/vendor/my-products', protect, vendor, getMyProducts);
router.get('/vendor', protect, vendor, getMyProducts);
router.post('/upload', protect, vendor, upload.array('images', 1), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const filePaths = req.files.map(file => `/uploads/products/${file.filename}`);
    res.status(200).json({ success: true, filePaths });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/', protect, vendor, createProduct);
router.put('/:id', protect, vendor, updateProduct);
router.patch('/status', protect, vendor, updateProductStatus);
router.patch('/:id/status', protect, vendor, updateProductStatus);
router.delete('/:id', protect, vendor, deleteProduct);

export default router;
