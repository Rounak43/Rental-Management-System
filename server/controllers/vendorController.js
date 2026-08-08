import Product from '../models/Product.js';
import Rental from '../models/Rental.js';

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/dashboard
// @access  Private/Vendor
export const getVendorDashboard = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    // Get all products owned by this vendor
    const products = await Product.find({ owner: vendorId });
    const productIds = products.map((p) => p._id);

    const totalProducts = products.length;
    const publishedProducts = products.filter((p) => p.isPublished).length;
    const availableProducts = products.filter((p) => p.availability).length;

    // Get all rentals for vendor products
    const rentals = await Rental.find({ product: { $in: productIds } })
      .populate('user', 'name email')
      .populate('product', 'title pricePerDay images')
      .sort({ createdAt: -1 });

    const totalRentals = rentals.length;
    const activeRentals = rentals.filter((r) => r.status === 'active').length;
    const pendingRentals = rentals.filter((r) => r.status === 'pending').length;
    const completedRentals = rentals.filter((r) => r.status === 'returned').length;

    // Revenue
    const totalRevenue = rentals
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.totalCost, 0);

    // Recent 5 rentals
    const recentRentals = rentals.slice(0, 5);

    res.status(200).json({
      stats: {
        totalProducts,
        publishedProducts,
        availableProducts,
        totalRentals,
        activeRentals,
        pendingRentals,
        completedRentals,
        totalRevenue,
      },
      recentRentals,
    });
  } catch (error) {
    next(error);
  }
};
