import mongoose from 'mongoose';

const vendorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    gst: {
      type: String,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    rentalCategory: {
      type: String,
      trim: true,
      default: '',
    },
    businessAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

const VendorProfile = mongoose.model('VendorProfile', vendorProfileSchema);

export default VendorProfile;
