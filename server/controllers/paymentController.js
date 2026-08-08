import Payment from '../models/Payment.js';
import Rental from '../models/Rental.js';
import Product from '../models/Product.js';

// @desc    Process checkout payment
// @route   POST /api/payments/process
// @access  Private
export const processPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;

    if (!amount || !paymentMethod || !transactionId) {
      return res.status(400).json({ message: 'Amount, payment method and transaction ID are required' });
    }

    const payment = await Payment.create({
      user: req.user._id,
      amount: Number(amount),
      paymentMethod,
      transactionId,
      status: 'completed',
      type: 'rental_payment',
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
// @access  Private/Admin
export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('rental')
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Refund security deposit
// @route   POST /api/payments/:id/refund-deposit
// @access  Private/Admin
export const refundDeposit = async (req, res, next) => {
  try {
    const rentalId = req.params.id;
    const rental = await Rental.findById(rentalId);

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    const refund = await Payment.create({
      rental: rentalId,
      user: rental.user,
      amount: rental.securityDepositPaid,
      paymentMethod: 'system_refund',
      transactionId: `REF_${Date.now()}`,
      status: 'completed',
      type: 'deposit_refund',
    });

    res.status(200).json(refund);
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor's payment records (revenue details)
// @route   GET /api/payments/vendor
// @access  Private/Vendor
export const getVendorPayments = async (req, res, next) => {
  try {
    const vendorProducts = await Product.find({ owner: req.user._id }).select('_id');
    const productIds = vendorProducts.map((p) => p._id);

    const rentals = await Rental.find({ product: { $in: productIds } }).select('_id');
    const rentalIds = rentals.map((r) => r._id);

    const payments = await Payment.find({ rental: { $in: rentalIds } })
      .populate('user', 'name email phone')
      .populate({
        path: 'rental',
        populate: {
          path: 'product',
          select: 'title pricePerDay'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};
