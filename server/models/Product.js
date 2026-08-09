import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product owner is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair'],
      required: [true, 'Product condition is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [0, 'Quantity cannot be negative'],
    },
    availableQuantity: {
      type: Number,
      required: true,
      default: 1,
      min: [0, 'Available quantity cannot be negative'],
    },
    pricePerHour: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price cannot be negative'],
    },
    pricePerWeek: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    pricePerMonth: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Security deposit cannot be negative'],
    },
    lateFee: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Late fee cannot be negative'],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance', 'retired'],
      default: 'available',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching products
productSchema.index({ title: 'text', brand: 'text', model: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ owner: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
