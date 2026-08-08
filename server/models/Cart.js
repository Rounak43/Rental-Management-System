import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required'],
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Quantity must be at least 1'],
  },
  rentalStart: {
    type: Date,
    required: [true, 'Rental start date is required'],
  },
  rentalEnd: {
    type: Date,
    required: [true, 'Rental end date is required'],
  },
});

// Enforce end date to be after start date
cartItemSchema.pre('validate', function (next) {
  if (this.rentalStart && this.rentalEnd && this.rentalEnd <= this.rentalStart) {
    this.invalidate('rentalEnd', 'Rental end date must be after start date');
  }
  next();
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true, // One cart per user
      index: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
