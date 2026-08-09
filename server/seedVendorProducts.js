import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-system';

// Define schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  role: { type: String, enum: ['customer', 'admin', 'vendor'], default: 'customer' },
  phone: String,
  isActive: { type: Boolean, default: true }
});
const User = mongoose.model('User', userSchema);

const vendorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: String,
  ownerName: String,
  gst: String,
  rentalCategory: String
});
const VendorProfile = mongoose.model('VendorProfile', vendorProfileSchema);

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String
});
const Category = mongoose.model('Category', categorySchema);

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [String],
  brand: String,
  model: String,
  condition: String,
  location: String,
  quantity: Number,
  availableQuantity: Number,
  pricePerDay: Number,
  securityDeposit: Number,
  lateFee: Number,
  availability: { type: Boolean, default: true }
});
const Product = mongoose.model('Product', productSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Fetch categories
    const categories = await Category.find({});
    const electronics = categories.find(c => c.slug === 'electronics')?._id || categories[0]?._id;
    const tools = categories.find(c => c.slug === 'tools-hardware')?._id || categories[1]?._id;
    const gaming = categories.find(c => c.slug === 'gaming')?._id || categories[2]?._id;

    // 2. Find or Create "rs coder" vendor
    const rsEmail = 'rscoder@gmail.com';
    let rsUser = await User.findOne({ email: rsEmail });
    if (!rsUser) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('password123', salt);
      rsUser = await User.create({
        name: 'RS Coder',
        email: rsEmail,
        password: hashed,
        role: 'vendor',
        phone: '9876543210',
        isActive: true
      });
      await VendorProfile.create({
        user: rsUser._id,
        companyName: 'RS Coder Pro Rentals',
        ownerName: 'RS Coder',
        gst: '36AAAAA1111A1Z1',
        rentalCategory: 'Electronics & Tools'
      });
      console.log(`✅ Created vendor "rs coder" with email ${rsEmail}`);
    }

    // 3. Find another vendor (e.g. vendor@test.com)
    let otherUser = await User.findOne({ email: 'vendor@test.com' });
    if (!otherUser) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('password123', salt);
      otherUser = await User.create({
        name: 'Elite Vendor',
        email: 'vendor@test.com',
        password: hashed,
        role: 'vendor',
        phone: '9988776655',
        isActive: true
      });
      await VendorProfile.create({
        user: otherUser._id,
        companyName: 'Elite Equipment Hub',
        ownerName: 'Elite Vendor',
        gst: '37BBBBB2222B1Z2',
        rentalCategory: 'High-end Cameras'
      });
      console.log('✅ Created other vendor vendor@test.com');
    }

    // 4. Products list to seed
    const productsData = [
      // RS Coder Products
      {
        title: 'Sony FX3 Cinema Camera Bundle',
        description: 'Professional full-frame cinema camera kit including XLR top handle, 2 batteries, and 160GB CFexpress card.',
        owner: rsUser._id,
        category: electronics,
        brand: 'Sony',
        model: 'FX3',
        condition: 'like-new',
        location: 'San Francisco, CA',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 1499,
        securityDeposit: 5000,
        lateFee: 200,
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800']
      },
      {
        title: 'Hilti TE 70-ATC Rotary Hammer Drill',
        description: 'Heavy duty rotary hammer drill for concrete drilling and chiseling with Active Torque Control.',
        owner: rsUser._id,
        category: tools,
        brand: 'Hilti',
        model: 'TE 70-ATC',
        condition: 'good',
        location: 'San Francisco, CA',
        quantity: 1, // Quantity 1 for sold-out testing!
        availableQuantity: 1,
        pricePerDay: 499,
        securityDeposit: 1500,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800']
      },
      {
        title: 'ASUS ROG Ally Handheld Console Z1 Extreme',
        description: 'Windows 11 handheld gaming console powered by AMD Ryzen Z1 Extreme processor and 512GB SSD.',
        owner: rsUser._id,
        category: gaming,
        brand: 'ASUS',
        model: 'ROG Ally',
        condition: 'new',
        location: 'San Francisco, CA',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 299,
        securityDeposit: 1000,
        lateFee: 30,
        images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800']
      },

      // Other Vendor Products
      {
        title: 'MacBook Pro 16" M3 Max (2024)',
        description: 'Apple Silicon M3 Max CPU, 36GB RAM, 1TB SSD. Perfect for mobile video editing and 3D rendering projects.',
        owner: otherUser._id,
        category: electronics,
        brand: 'Apple',
        model: 'MacBook Pro 16 M3 Max',
        condition: 'new',
        location: 'San Jose, CA',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 1999,
        securityDeposit: 8000,
        lateFee: 250,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800']
      },
      {
        title: 'DeWalt 20V Max Cordless Drill Driver Kit',
        description: 'Includes drill/driver, 2 batteries, charger, and contractor carrying bag. Ideal for home projects.',
        owner: otherUser._id,
        category: tools,
        brand: 'DeWalt',
        model: 'DCD771C2',
        condition: 'good',
        location: 'San Jose, CA',
        quantity: 5,
        availableQuantity: 5,
        pricePerDay: 150,
        securityDeposit: 500,
        lateFee: 20,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800']
      }
    ];

    // Delete existing products with these titles to prevent clutter
    const titles = productsData.map(p => p.title);
    await Product.deleteMany({ title: { $in: titles } });

    // Insert new products
    await Product.insertMany(productsData);
    console.log('✅ Successfully seeded equipment listings for RS Coder and Other Vendor!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

run();
