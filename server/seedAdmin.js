/**
 * Seed Admin User
 * Run once: node seedAdmin.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-system';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  role: { type: String, enum: ['customer', 'admin', 'vendor'], default: 'customer' },
  phone: String,
  profileImage: String,
  isVerified: Boolean,
  firebaseUid: String,
  authProvider: { type: String, default: 'local' },
  emailVerified: Boolean,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);

    const email = 'admin@rentsphere.com';
    const password = 'adminpassword123';

    // Check if admin already exists
    const existing = await User.findOne({ email });

    if (existing) {
      // Update password and role in case it was wrong
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      existing.password = hashed;
      existing.role = 'admin';
      existing.authProvider = 'local';
      existing.isActive = true;
      await existing.save();
      console.log('🔄 Admin user UPDATED (password reset):', email);
    } else {
      // Create fresh admin user
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      await User.create({
        name: 'Admin',
        email,
        password: hashed,
        role: 'admin',
        authProvider: 'local',
        isVerified: true,
        emailVerified: true,
        isActive: true,
      });
      console.log('✅ Admin user CREATED:', email);
    }

    console.log('\n📋 Admin credentials:');
    console.log('   Email   :', email);
    console.log('   Password:', password);
    console.log('   Role    : admin\n');

    await mongoose.disconnect();
    console.log('✅ Done. You can now log in as admin.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
