import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'vendor'],
      default: 'customer',
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    firebaseUid: {
      type: String,
      index: true,
    },
    authProvider: {
      type: String,
      default: 'local',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    address: {
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

// Strip password from JSON responses but NOT from live document instances
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    const obj = { ...ret }; // shallow copy — never mutate ret/doc in place
    delete obj.password;
    return obj;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
