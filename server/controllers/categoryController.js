import Category from '../models/Category.js';

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ isActive: true }).sort('name');

    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Vehicles', slug: 'vehicles', description: 'Cars, bikes, scooters and electric vehicles' },
        { name: 'Gym & Fitness', slug: 'gym', description: 'Treadmills, dumbbells and home gym equipment' },
        { name: 'Gaming', slug: 'gaming', description: 'Consoles, VR headsets, gaming PCs and accessories' },
        { name: 'Clothes & Fashion', slug: 'clothes', description: 'Designer tuxedos, suits, dresses and luxury watches' },
        { name: 'Electronics', slug: 'electronics', description: 'Laptops, cameras, drones and audio gear' },
        { name: 'Furniture', slug: 'furniture', description: 'Sofas, office chairs and home furniture' },
        { name: 'Tools & Machinery', slug: 'tools', description: 'Power tools, pressure washers and heavy machinery' },
      ];
      await Category.insertMany(defaultCategories);
      categories = await Category.find({ isActive: true }).sort('name');
    }

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, icon } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }

    const category = await Category.create({ name, slug, description, image, icon });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
