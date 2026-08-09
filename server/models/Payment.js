import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['rental_payment', 'deposit_refund', 'late_fee_charge', 'penalty_charge'],
      default: 'rental_payment',
    },
    lateFeeCollected: {
      type: Number,
      default: 0,
    },
    depositRefund: {
      type: Number,
      default: 0,
    },
    penaltyDeducted: {
      type: Number,
      default: 0,
    },
    invoiceGenerated: {
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

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
