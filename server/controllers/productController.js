import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import VendorProfile from '../models/VendorProfile.js';

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

// Helper to find Category ID from ID, Name, or Slug without creating it
const findCategoryId = async (categoryInput) => {
  if (!categoryInput) return null;
  if (mongoose.Types.ObjectId.isValid(categoryInput)) {
    return categoryInput;
  }
  let category = await Category.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${categoryInput}$`, 'i') } },
      { slug: categoryInput.toLowerCase() },
      { name: { $regex: new RegExp(categoryInput.split(' ')[0], 'i') } }
    ]
  });
  return category ? category._id : null;
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
      sortBy,
    } = req.query;

    const filter = { isPublished: true };

    if (category) {
      const categoryId = await findCategoryId(category);
      if (categoryId) {
        filter.category = categoryId;
      } else {
        // If category is provided but not found, force empty result by providing an impossible ID
        filter.category = new mongoose.Types.ObjectId();
      }
    }

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

    // Determine Sort Options
    let sortOption = { createdAt: -1 };
    if (sortBy === 'price-low') {
      sortOption = { pricePerDay: 1 };
    } else if (sortBy === 'price-high') {
      sortOption = { pricePerDay: -1 };
    } else if (sortBy === 'popular') {
      sortOption = { rating: -1, reviewCount: -1 };
    } else if (sortBy === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('owner', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // Fetch vendor profiles for all product owners to attach company names
    const ownerIds = products.map((p) => p.owner?._id).filter(Boolean);
    const profiles = await VendorProfile.find({ user: { $in: ownerIds } });
    const profileMap = {};
    profiles.forEach((prof) => {
      profileMap[prof.user.toString()] = prof.companyName;
    });

    const productsWithCompany = products.map((p) => {
      const pObj = p.toObject();
      if (pObj.owner) {
        const companyName = profileMap[pObj.owner._id.toString()];
        pObj.owner.name = companyName || pObj.owner.name; // replace user name with company name
      }
      return pObj;
    });

    res.status(200).json({
      products: productsWithCompany,
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

    const pObj = product.toObject();
    const vendorProfile = await VendorProfile.findOne({ user: product.owner?._id });
    if (vendorProfile) {
      pObj.vendor = {
        companyName: vendorProfile.companyName,
        ownerName: vendorProfile.ownerName,
        logo: vendorProfile.logo,
        contactPhone: vendorProfile.contactPhone,
        website: vendorProfile.website,
      };
    } else {
      pObj.vendor = {
        companyName: product.owner?.name || 'Verified Vendor',
        ownerName: product.owner?.name || 'Owner',
      };
    }

    res.status(200).json(pObj);
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
      currentlyRented: req.body.currentlyRented !== undefined ? Number(req.body.currentlyRented) : 0,
      pricePerDay: Number(pricePerDay),
      securityDeposit: Number(securityDeposit || 0),
      lateFee: Number(req.body.lateFee || req.body.lateFeePerHour || 50),
      lateFeePerHour: Number(req.body.lateFeePerHour || req.body.lateFee || 50),
      gracePeriod: Number(req.body.gracePeriod !== undefined ? req.body.gracePeriod : 2),
      maximumLateFee: Number(req.body.maximumLateFee !== undefined ? req.body.maximumLateFee : 500),
      productStatus: req.body.productStatus || 'available',
      status: req.body.status || req.body.productStatus || 'available',
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
