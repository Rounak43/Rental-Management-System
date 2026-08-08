import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Helper to resolve Category ID from ID, Name, or Slug
const resolveCategoryId = async (categoryInput) => {
  if (!categoryInput) return null;

  // Check if it is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(categoryInput)) {
    return categoryInput;
  }

  // If not a valid ObjectId, assume it is a category name or slug
  let category = await Category.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${categoryInput}$`, 'i') } },
      { slug: categoryInput.toLowerCase() },
      { name: { $regex: new RegExp(categoryInput.split(' ')[0], 'i') } }
    ]
  });

  // If not found, dynamically create it
  if (!category) {
    const slug = categoryInput.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    category = await Category.create({
      name: categoryInput,
      slug,
    });
  }

  return category._id;
};

// @desc    Get all published products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      availability,
      condition,
      minPrice,
      maxPrice,
      location,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (availability === 'true') filter.availability = true;
    if (condition) filter.condition = condition;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate('owner', 'name email phone');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor's own products
// @route   GET /api/products/my-products
// @access  Private/Vendor
export const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ owner: req.user._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product (vendor or admin)
// @route   POST /api/products
// @access  Private/Vendor
export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      location,
      condition,
      quantity,
      pricePerDay,
      securityDeposit,
      lateFee,
      images,
    } = req.body;

    // Validation
    if (!title || !category || !description || !location || !condition || !pricePerDay) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    if (Number(pricePerDay) < 0 || Number(securityDeposit || 0) < 0 || Number(lateFee || 0) < 0) {
      return res.status(400).json({ message: 'Prices and fees cannot be negative' });
    }

    const qty = Number(quantity || 1);
    if (qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const categoryId = await resolveCategoryId(category);

    const productData = {
      ...req.body,
      category: categoryId,
      owner: req.user._id,
      quantity: qty,
      availableQuantity: req.body.availableQuantity !== undefined ? Number(req.body.availableQuantity) : qty,
      pricePerDay: Number(pricePerDay),
      securityDeposit: Number(securityDeposit || 0),
      lateFee: Number(lateFee || 0),
    };

    const product = await Product.create(productData);
    await product.populate('category', 'name slug');

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (owner or admin)
// @route   PUT /api/products/:id
// @access  Private/Vendor
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only owner or admin can update
    if (
      product.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updateData = { ...req.body };

    // Validate inputs if updated
    if (updateData.pricePerDay !== undefined && Number(updateData.pricePerDay) < 0) {
      return res.status(400).json({ message: 'Price per day cannot be negative' });
    }
    if (updateData.securityDeposit !== undefined && Number(updateData.securityDeposit) < 0) {
      return res.status(400).json({ message: 'Security deposit cannot be negative' });
    }
    if (updateData.lateFee !== undefined && Number(updateData.lateFee) < 0) {
      return res.status(400).json({ message: 'Late fee cannot be negative' });
    }
    if (updateData.quantity !== undefined) {
      const qty = Number(updateData.quantity);
      if (qty < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
      }
      updateData.quantity = qty;
    }

    if (updateData.category) {
      updateData.category = await resolveCategoryId(updateData.category);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (owner or admin)
// @route   DELETE /api/products/:id
// @access  Private/Vendor
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (
      product.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product publish status (publish or hide)
// @route   PATCH /api/products/status or PATCH /api/products/:id/status
// @access  Private/Vendor
export const updateProductStatus = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id;
    const { isPublished } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only owner or admin can update status
    if (
      product.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this product status' });
    }

    product.isPublished = isPublished !== undefined ? isPublished : !product.isPublished;
    await product.save();

    res.status(200).json({
      message: `Product ${product.isPublished ? 'published' : 'hidden'} successfully`,
      product,
    });
  } catch (error) {
    next(error);
  }
};
