import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rentStartDate: {
      type: Date,
      required: true,
    },
    rentEndDate: {
      type: Date,
      required: true,
    },
    actualReturnDate: {
      type: Date,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDepositPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'returned', 'overdue', 'cancelled'],
      default: 'pending',
    },
    pickupStatus: {
      type: String,
      enum: ['pending', 'picked_up'],
      default: 'pending',
    },
    returnStatus: {
      type: String,
      enum: ['pending', 'returned'],
      default: 'pending',
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    pickupConfirmedAt: {
      type: Date,
    },
    pickupConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    pickupOTP: {
      type: String,
    },
    pickupQRCode: {
      type: String,
    },
    returnConfirmedAt: {
      type: Date,
    },
    returnCondition: {
      type: String,
      enum: ['good', 'like-new', 'fair', 'damaged', 'missing-parts'],
      default: 'good',
    },
    damageReport: {
      type: String,
      default: '',
    },
    inspectionNotes: {
      type: String,
      default: '',
    },
    missingAccessories: {
      type: String,
      default: '',
    },
    damageCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    depositDeducted: {
      type: Number,
      default: 0,
      min: 0,
    },
    penaltyDeducted: {
      type: Number,
      default: 0,
      min: 0,
    },
    repairRequired: {
      type: Boolean,
      default: false,
    },
    invoiceId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Rental = mongoose.model('Rental', rentalSchema);

export default Rental;
