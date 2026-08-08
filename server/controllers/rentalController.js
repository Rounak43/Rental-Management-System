import Rental from '../models/Rental.js';
import Product from '../models/Product.js';

// @desc    Create a new rental booking
// @route   POST /api/rentals
// @access  Private/Customer
export const createRental = async (req, res, next) => {
  try {
    const productId = req.body.product;
    const rentStartDate = req.body.rentStartDate || req.body.startDate;
    const rentEndDate = req.body.rentEndDate || req.body.endDate;

    if (!productId || !rentStartDate || !rentEndDate) {
      return res.status(400).json({ message: 'Product, start date, and end date are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!product.availability || product.availableQuantity < 1) {
      return res.status(400).json({ message: 'Product is not available for rent' });
    }

    const start = new Date(rentStartDate);
    const end = new Date(rentEndDate);
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalCost = days * product.pricePerDay;
    const securityDepositPaid = product.securityDeposit;

    const rental = await Rental.create({
      user: req.user._id,
      product: productId,
      rentStartDate: start,
      rentEndDate: end,
      totalCost,
      securityDepositPaid,
      status: 'pending',
    });

    // Decrement available quantity
    await Product.findByIdAndUpdate(productId, {
      $inc: { availableQuantity: -1 },
      ...(product.availableQuantity - 1 === 0 ? { availability: false } : {}),
    });

    await rental.populate([
      { path: 'product', select: 'title images pricePerDay' },
      { path: 'user', select: 'name email' },
    ]);

    res.status(201).json(rental);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's rentals
// @route   GET /api/rentals/my-rentals
// @access  Private
export const getMyRentals = async (req, res, next) => {
  try {
    const rentals = await Rental.find({ user: req.user._id })
      .populate('product', 'title images pricePerDay location category')
      .sort({ createdAt: -1 });

    res.status(200).json(rentals);
  } catch (error) {
    next(error);
  }
};

// @desc    Get rentals for vendor's products
// @route   GET /api/rentals/vendor-rentals
// @access  Private/Vendor
export const getVendorRentals = async (req, res, next) => {
  try {
    // Get all products owned by this vendor
    const vendorProducts = await Product.find({ owner: req.user._id }).select('_id');
    const productIds = vendorProducts.map((p) => p._id);

    const rentals = await Rental.find({ product: { $in: productIds } })
      .populate('product', 'title images pricePerDay')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(rentals);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rentals (admin)
// @route   GET /api/rentals
// @access  Private/Admin
export const getAllRentals = async (req, res, next) => {
  try {
    const rentals = await Rental.find()
      .populate('product', 'title images pricePerDay')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(rentals);
  } catch (error) {
    next(error);
  }
};

// @desc    Update pickup status
// @route   PATCH /api/rentals/:id/pickup
// @access  Private/Admin/Vendor
export const updatePickupStatus = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    // Allow Admin OR the Product Owner (Vendor)
    const product = await Product.findById(rental.product);
    if (req.user.role !== 'admin' && product?.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update pickup for this rental' });
    }

    rental.pickupStatus = 'picked_up';
    rental.status = 'active';
    await rental.save();
    res.status(200).json(rental);
  } catch (error) {
    next(error);
  }
};

// @desc    Update return status and handle late fees
// @route   PATCH /api/rentals/:id/return
// @access  Private/Admin/Vendor
export const updateReturnStatus = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    // Allow Admin OR the Product Owner (Vendor)
    const product = await Product.findById(rental.product);
    if (req.user.role !== 'admin' && product?.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update return for this rental' });
    }

    const { lateFee, status } = req.body;
    const actualReturnDate = new Date();
    let calculatedLateFee = 0;

    if (actualReturnDate > rental.rentEndDate) {
      const overdueDays = Math.ceil(
        (actualReturnDate - rental.rentEndDate) / (1000 * 60 * 60 * 24)
      );
      calculatedLateFee = overdueDays * (product.pricePerDay * 1.5);
    }

    rental.returnStatus = 'returned';
    rental.status = status || 'returned';
    rental.actualReturnDate = actualReturnDate;
    rental.lateFee = lateFee !== undefined ? Number(lateFee) : calculatedLateFee;
    await rental.save();

    // Restore product availability
    await Product.findByIdAndUpdate(rental.product, {
      $inc: { availableQuantity: 1 },
      availability: true,
    });

    res.status(200).json(rental);
  } catch (error) {
    next(error);
  }
};

// @desc    Update rental booking status (approve or reject)
// @route   PATCH /api/rentals/:id/status
// @access  Private/Vendor/Admin
export const updateRentalStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active', 'cancelled', etc.
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    // Check auth: User must be admin OR the owner of the product
    const product = await Product.findById(rental.product);
    if (req.user.role !== 'admin' && product?.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this rental status' });
    }

    if (status === 'cancelled' && rental.status !== 'cancelled') {
      // Revert product availableQuantity increment if cancelled
      await Product.findByIdAndUpdate(rental.product, {
        $inc: { availableQuantity: 1 },
        availability: true,
      });
    }

    rental.status = status;
    await rental.save();

    res.status(200).json(rental);
  } catch (error) {
    next(error);
  }
};

// @desc    Get rental analytics (admin)
// @route   GET /api/rentals/reports/analytics
// @access  Private/Admin
export const getRentalReports = async (req, res, next) => {
  try {
    const total = await Rental.countDocuments();
    const active = await Rental.countDocuments({ status: 'active' });
    const pending = await Rental.countDocuments({ status: 'pending' });
    const returned = await Rental.countDocuments({ status: 'returned' });
    const revenueAgg = await Rental.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCost' } } },
    ]);
    const revenue = revenueAgg[0]?.total || 0;

    res.status(200).json({ total, active, pending, returned, revenue });
  } catch (error) {
    next(error);
  }
};
