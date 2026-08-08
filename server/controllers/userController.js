import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.profileImage = req.body.profileImage || user.profileImage;

    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address,
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
      address: updatedUser.address,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (with optional role filtering and stats)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments({});
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });

    res.status(200).json({
      success: true,
      count: users.length,
      stats: {
        totalUsers,
        totalCustomers,
        totalVendors,
      },
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single user account
// @route   DELETE /api/users/:id
// @access  Private (Admin or Self)
export const deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Allow deletion if requester is admin OR self
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to delete this account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User account (${userToDelete.email}) successfully deleted`,
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete all Customer and Vendor accounts
// @route   DELETE /api/users/bulk/delete-all
// @access  Private/Admin
export const bulkDeleteAccounts = async (req, res, next) => {
  try {
    const result = await User.deleteMany({ role: { $in: ['customer', 'vendor'] } });

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} customer and vendor accounts`,
    });
  } catch (error) {
    next(error);
  }
};
