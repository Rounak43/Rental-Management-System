import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: { type: String, default: 'RentSphere' },
    contactEmail: { type: String, default: 'support@rentsphere.com' },
    commissionRate: { type: Number, default: 10 },
    taxRate: { type: Number, default: 18 },
    maintenanceMode: { type: Boolean, default: false },
    _singleton: { type: String, default: 'singleton', unique: true },
  },
  { timestamps: true }
);

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);
export default PlatformSettings;
