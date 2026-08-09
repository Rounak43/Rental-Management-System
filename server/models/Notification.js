import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'return_reminder',
        'late_return',
        'payment_success',
        'refund_issued',
        'vendor_approval',
        'product_approved',
        'product_rejected',
        'wishlist_offer',
        'discount',
        'system'
      ],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedRental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
