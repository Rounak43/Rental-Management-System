import Rental from '../models/Rental.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';

// Helper to auto-update overdue rentals and heal past returned rental calculations
const checkAndMarkOverdue = async () => {
  try {
    const now = new Date();
    await Rental.updateMany(
      {
        status: 'active',
        rentEndDate: { $lt: now }
      },
      {
        $set: { status: 'overdue' }
      }
    );

    // Auto-heal returned rentals where refundAmount was unpopulated (0) even though deposit > lateFee
    const returnedRentals = await Rental.find({ status: 'returned' });
    for (const r of returnedRentals) {
      const deposit = r.securityDepositPaid || 0;
      const late = r.lateFee || 0;
      const damage = r.damageCharges || 0;
      const totalDeductions = late + damage;
      const expectedRefund = Math.max(0, deposit - totalDeductions);
      const expectedDeducted = Math.min(deposit, totalDeductions);

      if (r.refundAmount !== expectedRefund || r.depositDeducted !== expectedDeducted) {
        r.refundAmount = expectedRefund;
        r.depositDeducted = expectedDeducted;
        await r.save();
      }
    }
  } catch (err) {
    console.error('Error auto-updating overdue rentals:', err);
  }
};

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

    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const totalCost = days * product.pricePerDay;
    const securityDepositPaid = product.securityDeposit || 0;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const rental = await Rental.create({
      user: req.user._id,
      product: productId,
      rentStartDate: start,
      rentEndDate: end,
      totalCost,
      securityDepositPaid,
      status: 'pending',
      pickupOTP: otp,
      pickupQRCode: `RENT-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    });

    // Decrement available quantity
    const newQty = product.availableQuantity - 1;
    await Product.findByIdAndUpdate(productId, {
      $inc: { availableQuantity: -1 },
      ...(newQty <= 0 ? { availability: false } : {}),
    });

    // Create payment log record
    await Payment.create({
      rental: rental._id,
      user: req.user._id,
      amount: totalCost + securityDepositPaid,
      paymentMethod: req.body.paymentMethod || 'Razorpay / Card',
      status: 'completed',
      transactionId: `TXN_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      type: 'rental_payment',
    }).catch(err => console.error('Payment log create notice:', err.message));

    await rental.populate([
      { path: 'product', select: 'title images pricePerDay securityDeposit' },
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
    await checkAndMarkOverdue();
    const rentals = await Rental.find({ user: req.user._id })
      .populate('product', 'title images pricePerDay location category owner lateFeePerHour gracePeriod maximumLateFee')
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
    await checkAndMarkOverdue();
    const vendorProducts = await Product.find({ owner: req.user._id }).select('_id');
    const productIds = vendorProducts.map((p) => p._id);

    const rentals = await Rental.find({ product: { $in: productIds } })
      .populate('product', 'title images pricePerDay securityDeposit lateFeePerHour gracePeriod maximumLateFee')
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
    await checkAndMarkOverdue();
    const rentals = await Rental.find()
      .populate('product', 'title images pricePerDay securityDeposit')
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

    const product = await Product.findById(rental.product);
    if (req.user.role !== 'admin' && product?.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update pickup for this rental' });
    }

    rental.pickupStatus = 'picked_up';
    rental.status = 'active';
    rental.pickupConfirmedAt = new Date();
    rental.pickupConfirmedBy = req.user._id;
    await rental.save();

    // Update currently rented count
    await Product.findByIdAndUpdate(rental.product, {
      $inc: { currentlyRented: 1 }
    });

    res.status(200).json(rental);
  } catch (error) {
    next(error);
  }
};

// @desc    Update return status and handle automatic hourly late fees & deposit settlement
// @route   PATCH /api/rentals/:id/return
// @access  Private/Admin/Vendor
export const updateReturnStatus = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    const product = await Product.findById(rental.product);
    if (req.user.role !== 'admin' && product?.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update return for this rental' });
    }

    const actualReturnDate = new Date();
    const endDate = new Date(rental.rentEndDate);

    // Automatic Hourly Late Fee Calculation
    let delayHours = 0;
    let lateFee = 0;

    if (actualReturnDate > endDate) {
      const diffMs = actualReturnDate - endDate;
      const rawHours = diffMs / (1000 * 60 * 60);
      delayHours = Math.ceil(rawHours);

      const gracePeriod = product?.gracePeriod !== undefined ? product.gracePeriod : 2;
      const lateFeePerHour = product?.lateFeePerHour || product?.lateFee || 50;
      const maximumLateFee = product?.maximumLateFee !== undefined ? product.maximumLateFee : 500;

      if (delayHours > gracePeriod) {
        lateFee = Math.min(delayHours * lateFeePerHour, maximumLateFee);
      }
    }

    // Security Deposit Settlement Calculation
    const damageCharges = Number(req.body.damageCharges || req.body.damageFee || 0);
    const depositPaid = Number(rental.securityDepositPaid || product?.securityDeposit || 0);

    // If manual lateFee is passed in body, allow override if explicitly provided, else use auto calculated lateFee
    const finalLateFee = req.body.lateFee !== undefined ? Number(req.body.lateFee) : lateFee;
    const totalDeductions = finalLateFee + damageCharges;
    const refundAmount = Math.max(0, depositPaid - totalDeductions);
    const depositDeducted = Math.min(depositPaid, totalDeductions);
    const penaltyDeducted = damageCharges;

    const returnCondition = req.body.returnCondition || req.body.condition || 'good';
    const damageReport = req.body.damageReport || '';
    const inspectionNotes = req.body.inspectionNotes || '';
    const missingAccessories = req.body.missingAccessories || '';
    const repairRequired = Boolean(req.body.repairRequired || returnCondition === 'damaged' || returnCondition === 'missing-parts');
    const invoiceId = `INV-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

    rental.returnStatus = 'returned';
    rental.status = 'returned';
    rental.actualReturnDate = actualReturnDate;
    rental.returnConfirmedAt = actualReturnDate;
    rental.lateFee = finalLateFee;
    rental.lateHours = delayHours;
    rental.damageCharges = damageCharges;
    rental.refundAmount = refundAmount;
    rental.depositDeducted = depositDeducted;
    rental.penaltyDeducted = penaltyDeducted;
    rental.returnCondition = returnCondition;
    rental.damageReport = damageReport;
    rental.inspectionNotes = inspectionNotes;
    rental.missingAccessories = missingAccessories;
    rental.repairRequired = repairRequired;
    rental.invoiceId = invoiceId;

    await rental.save();

    // Always log settlement Payment entry
    await Payment.create({
      rental: rental._id,
      user: rental.user,
      amount: refundAmount > 0 ? refundAmount : depositDeducted,
      paymentMethod: refundAmount > 0 ? 'deposit_refund' : 'late_fee_deduction',
      transactionId: `SETTLE_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      status: 'completed',
      type: refundAmount > 0 ? 'deposit_refund' : 'late_fee_charge',
      depositRefund: refundAmount,
      penaltyDeducted,
      lateFeeCollected: finalLateFee,
      invoiceGenerated: true,
      invoiceId,
    }).catch(err => console.error('Settlement payment log error:', err.message));

    // Inventory & Repair Workflow Update
    if (repairRequired) {
      await Product.findByIdAndUpdate(rental.product, {
        $inc: { currentlyRented: -1 },
        status: 'maintenance',
        productStatus: 'maintenance',
        repairStatus: 'pending',
        availability: false,
      });
    } else {
      await Product.findByIdAndUpdate(rental.product, {
        $inc: { availableQuantity: 1, currentlyRented: -1 },
        status: 'available',
        productStatus: 'available',
        availability: true,
      });
    }

    await rental.populate([
      { path: 'product', select: 'title images pricePerDay securityDeposit' },
      { path: 'user', select: 'name email phone' },
    ]);

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
    const { status } = req.body;
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    const product = await Product.findById(rental.product);
    if (req.user.role !== 'admin' && product?.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this rental status' });
    }

    if (status === 'cancelled' && rental.status !== 'cancelled') {
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
    await checkAndMarkOverdue();
    const total = await Rental.countDocuments();
    const active = await Rental.countDocuments({ status: 'active' });
    const pending = await Rental.countDocuments({ status: 'pending' });
    const returned = await Rental.countDocuments({ status: 'returned' });
    const overdue = await Rental.countDocuments({ status: 'overdue' });

    const revenueAgg = await Rental.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalCost' }, lateFees: { $sum: '$lateFee' } } },
    ]);
    const revenue = revenueAgg[0]?.total || 0;
    const totalLateFees = revenueAgg[0]?.lateFees || 0;

    res.status(200).json({ total, active, pending, returned, overdue, revenue, totalLateFees });
  } catch (error) {
    next(error);
  }
};

