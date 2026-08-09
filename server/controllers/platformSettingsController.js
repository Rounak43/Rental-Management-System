import PlatformSettings from '../models/PlatformSettings.js';

// @desc    Get platform settings
// @route   GET /api/settings
// @access  Public (read) / Admin (write)
export const getSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne({ _singleton: 'singleton' });
    if (!settings) {
      settings = await PlatformSettings.create({ _singleton: 'singleton' });
    }
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update platform settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const { platformName, contactEmail, commissionRate, taxRate, maintenanceMode } = req.body;
    const settings = await PlatformSettings.findOneAndUpdate(
      { _singleton: 'singleton' },
      { platformName, contactEmail, commissionRate: Number(commissionRate), taxRate: Number(taxRate), maintenanceMode },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};
