import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true, // One wishlist per user
      index: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to prevent duplicate product ObjectIds inside the wishlist
wishlistSchema.pre('save', function (next) {
  if (this.products && this.products.length > 0) {
    const seen = new Set();
    this.products = this.products.filter((prodId) => {
      const stringId = prodId.toString();
      if (seen.has(stringId)) {
        return false;
      }
      seen.add(stringId);
      return true;
    });
  }
  next();
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
