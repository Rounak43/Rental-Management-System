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
  availability: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true }
});
const Product = mongoose.model('Product', productSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Ensure categories exist
    const categoriesData = [
      { name: 'Electronics & Tech', slug: 'electronics' },
      { name: 'Tools & Hardware', slug: 'tools-hardware' },
      { name: 'Gaming & Consoles', slug: 'gaming' },
      { name: 'Vehicles & Bikes', slug: 'vehicles' },
      { name: 'Fitness & Gym', slug: 'fitness-gym' },
      { name: 'Home & Furniture', slug: 'home-furniture' },
      { name: 'Apparel & Clothing', slug: 'apparel-clothing' },
      { name: 'Event & Party Gear', slug: 'event-party' }
    ];

    for (const cat of categoriesData) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
      }
    }

    const categories = await Category.find({});
    console.log(`✅ Loaded ${categories.length} categories.`);

    const catMap = {};
    categories.forEach(c => {
      catMap[c.slug] = c._id;
    });

    // Helper to get category ID
    const getCatId = (slug) => catMap[slug] || categories[0]._id;

    // 2. Find or Create vendor accounts
    const rsEmail = 'rounaks135@gmail.com';
    let rsUser = await User.findOne({ email: rsEmail });
    if (!rsUser) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('Rounak@43', salt);
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
        rentalCategory: 'All categories'
      });
      console.log(`✅ Created vendor "RS Coder" (${rsEmail})`);
    }

    let testVendor = await User.findOne({ email: 'vendor@test.com' });
    if (!testVendor) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('password123', salt);
      testVendor = await User.create({
        name: 'Elite Vendor',
        email: 'vendor@test.com',
        password: hashed,
        role: 'vendor',
        phone: '9988776655',
        isActive: true
      });
      await VendorProfile.create({
        user: testVendor._id,
        companyName: 'Elite Equipment Hub',
        ownerName: 'Elite Vendor',
        gst: '37BBBBB2222B1Z2',
        rentalCategory: 'All categories'
      });
      console.log('✅ Created vendor vendor@test.com');
    }

    // 3. Define 50+ high-quality products across all categories
    const productsList = [
      // === ELECTRONICS & TECH (1-8) ===
      {
        title: 'Sony Alpha A7 IV Mirrorless Camera',
        description: '33MP full-frame mirrorless camera. Superb photo and 4K video quality. Excellent for event photography.',
        owner: rsUser._id,
        category: getCatId('electronics'),
        brand: 'Sony',
        model: 'A7 IV',
        condition: 'like-new',
        location: 'Koramangala, Bangalore',
        quantity: 5,
        availableQuantity: 5,
        pricePerDay: 1200,
        securityDeposit: 5000,
        lateFee: 150,
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800']
      },
      {
        title: 'DJI Mavic 3 Pro Drone Combo',
        description: 'Triple-camera flagship drone. Hasselblad camera, 43 min flight time, omnidirectional obstacle sensing.',
        owner: rsUser._id,
        category: getCatId('electronics'),
        brand: 'DJI',
        model: 'Mavic 3 Pro',
        condition: 'new',
        location: 'Indiranagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 1800,
        securityDeposit: 8000,
        lateFee: 250,
        images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800']
      },
      {
        title: 'Apple MacBook Pro 16" M3 Max',
        description: 'Apple M3 Max chip, 36GB unified memory, 1TB SSD. Built for demanding video editing and 3D modeling tasks.',
        owner: testVendor._id,
        category: getCatId('electronics'),
        brand: 'Apple',
        model: 'MacBook Pro 16 M3',
        condition: 'new',
        location: 'Whitefield, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 2500,
        securityDeposit: 10000,
        lateFee: 300,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800']
      },
      {
        title: 'Canon EOS R6 Mark II Camera',
        description: '24.2 MP full-frame mirrorless camera with dual pixel CMOS AF II, up to 40 fps electronic shutter.',
        owner: testVendor._id,
        category: getCatId('electronics'),
        brand: 'Canon',
        model: 'EOS R6 Mk II',
        condition: 'good',
        location: 'Koramangala, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 1100,
        securityDeposit: 4500,
        lateFee: 120,
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800']
      },
      {
        title: 'Epson EH-TW7000 4K Projector',
        description: 'High brightness 3,000 lumens 4K PRO-UHD home theater projector. Dual HDMI ports and built-in speaker.',
        owner: rsUser._id,
        category: getCatId('electronics'),
        brand: 'Epson',
        model: 'EH-TW7000',
        condition: 'good',
        location: 'Jayanagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 900,
        securityDeposit: 3000,
        lateFee: 100,
        images: ['https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800']
      },
      {
        title: 'Sennheiser EW-D Wireless Microphone',
        description: 'Digital wireless lavalier microphone system. Exceptionally clean audio performance for video and broadcast.',
        owner: rsUser._id,
        category: getCatId('electronics'),
        brand: 'Sennheiser',
        model: 'EW-D ME2',
        condition: 'like-new',
        location: 'HSR Layout, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 500,
        securityDeposit: 2000,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800']
      },
      {
        title: 'GoPro Hero 12 Black Action Cam',
        description: 'Rugged action camera featuring 5.3K HDR video, HyperSmooth 6.0 stabilization, and waterproof design up to 33ft.',
        owner: testVendor._id,
        category: getCatId('electronics'),
        brand: 'GoPro',
        model: 'Hero 12 Black',
        condition: 'new',
        location: 'MG Road, Bangalore',
        quantity: 8,
        availableQuantity: 8,
        pricePerDay: 400,
        securityDeposit: 1500,
        lateFee: 40,
        images: ['https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800']
      },
      {
        title: 'JBL PartyBox 310 Bluetooth Speaker',
        description: '240W powerful portable speaker with dynamic light show, dual mic/guitar inputs, and IPX4 splashproof rating.',
        owner: rsUser._id,
        category: getCatId('electronics'),
        brand: 'JBL',
        model: 'PartyBox 310',
        condition: 'good',
        location: 'Indiranagar, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 800,
        securityDeposit: 3000,
        lateFee: 80,
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800']
      },

      // === TOOLS & HARDWARE (9-16) ===
      {
        title: 'Bosch GSB 18V-55 Cordless Drill',
        description: 'Brushless hammer drill with 18V Lithium-Ion battery. Excellent for masonry and heavy wood drilling.',
        owner: rsUser._id,
        category: getCatId('tools-hardware'),
        brand: 'Bosch',
        model: 'GSB 18V-55',
        condition: 'good',
        location: 'Koramangala, Bangalore',
        quantity: 1, // Quantity 1 for Sold Out testing
        availableQuantity: 1,
        pricePerDay: 300,
        securityDeposit: 1000,
        lateFee: 30,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800']
      },
      {
        title: 'DeWalt DWS779 12-Inch Miter Saw',
        description: 'Double-bevel sliding compound miter saw powered by a 15-Amp motor. Extremely precise crosscut alignment.',
        owner: testVendor._id,
        category: getCatId('tools-hardware'),
        brand: 'DeWalt',
        model: 'DWS779',
        condition: 'like-new',
        location: 'Whitefield, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 600,
        securityDeposit: 2500,
        lateFee: 70,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800']
      },
      {
        title: 'Karcher K5 Premium Pressure Washer',
        description: '2000 PSI high-pressure electric power washer. Perfect for patio, driveway, and auto cleaning.',
        owner: rsUser._id,
        category: getCatId('tools-hardware'),
        brand: 'Karcher',
        model: 'K5 Premium',
        condition: 'good',
        location: 'HSR Layout, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 450,
        securityDeposit: 1800,
        lateFee: 40,
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800']
      },
      {
        title: 'Makita LS1019L Sliding Compound Miter Saw',
        description: '10-inch dual-bevel sliding miter saw with laser alignment. Superior dust extraction performance.',
        owner: testVendor._id,
        category: getCatId('tools-hardware'),
        brand: 'Makita',
        model: 'LS1019L',
        condition: 'good',
        location: 'Jayanagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 550,
        securityDeposit: 2200,
        lateFee: 60,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800']
      },
      {
        title: 'Stanley 99-Piece Socket Set',
        description: 'Professional socket set containing 1/4" and 3/8" drive ratchets and multiple metric sockets.',
        owner: rsUser._id,
        category: getCatId('tools-hardware'),
        brand: 'Stanley',
        model: '99-socket-set',
        condition: 'good',
        location: 'Indiranagar, Bangalore',
        quantity: 5,
        availableQuantity: 5,
        pricePerDay: 150,
        securityDeposit: 600,
        lateFee: 20,
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800']
      },
      {
        title: 'Honda EU2200i Portable Generator',
        description: 'Super quiet 2200-watt inverter generator. Perfect for camping, tailgating, and emergency home power.',
        owner: rsUser._id,
        category: getCatId('tools-hardware'),
        brand: 'Honda',
        model: 'EU2200i',
        condition: 'like-new',
        location: 'Hebbal, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 990,
        securityDeposit: 4000,
        lateFee: 100,
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800']
      },
      {
        title: 'Husqvarna 450R Chainsaw 20"',
        description: 'Powerful 50.2cc all-round chainsaw. Easy to start, features X-Torq engine for lower emissions.',
        owner: testVendor._id,
        category: getCatId('tools-hardware'),
        brand: 'Husqvarna',
        model: '450R',
        condition: 'good',
        location: 'Whitefield, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 500,
        securityDeposit: 2000,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800']
      },
      {
        title: 'Milwaukee M18 Fuel Leaf Blower',
        description: 'Cordless electric leaf blower delivering up to 450 CFM air volume. Lightweight ergonomic design.',
        owner: rsUser._id,
        category: getCatId('tools-hardware'),
        brand: 'Milwaukee',
        model: 'M18 Fuel',
        condition: 'like-new',
        location: 'HSR Layout, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 250,
        securityDeposit: 1000,
        lateFee: 25,
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800']
      },

      // === GAMING & CONSOLES (17-24) ===
      {
        title: 'Sony PlayStation 5 Slim Console',
        description: 'Newest PS5 Slim disc version with 1TB SSD storage, one DualSense controller, and pre-installed Astro Bot.',
        owner: rsUser._id,
        category: getCatId('gaming'),
        brand: 'Sony',
        model: 'PS5 Slim Disc',
        condition: 'new',
        location: 'Koramangala, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 450,
        securityDeposit: 2000,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800']
      },
      {
        title: 'Nintendo Switch OLED Model',
        description: '7-inch OLED screen model with Neon Blue/Neon Red Joy-Cons. Vibrant colors and crisp contrast.',
        owner: testVendor._id,
        category: getCatId('gaming'),
        brand: 'Nintendo',
        model: 'Switch OLED',
        condition: 'like-new',
        location: 'Jayanagar, Bangalore',
        quantity: 5,
        availableQuantity: 5,
        pricePerDay: 300,
        securityDeposit: 1200,
        lateFee: 30,
        images: ['https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800']
      },
      {
        title: 'Xbox Series X 1TB Console',
        description: 'The fastest, most powerful Xbox ever. Native 4K gaming, 120 fps support, and 12 teraflops processing power.',
        owner: rsUser._id,
        category: getCatId('gaming'),
        brand: 'Microsoft',
        model: 'Xbox Series X',
        condition: 'good',
        location: 'Indiranagar, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 450,
        securityDeposit: 2000,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800']
      },
      {
        title: 'Meta Quest 3 512GB VR Headset',
        description: 'Next-generation mixed reality headset. Double the processing power of Quest 2 for immersive gaming.',
        owner: testVendor._id,
        category: getCatId('gaming'),
        brand: 'Meta',
        model: 'Quest 3 512GB',
        condition: 'new',
        location: 'Whitefield, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 500,
        securityDeposit: 2500,
        lateFee: 60,
        images: ['https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=800']
      },
      {
        title: 'PlayStation VR2 Headset Combo',
        description: 'Immersive VR headset for PS5 with controllers and Horizon Call of the Mountain game bundle included.',
        owner: rsUser._id,
        category: getCatId('gaming'),
        brand: 'Sony',
        model: 'PSVR2',
        condition: 'like-new',
        location: 'HSR Layout, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 450,
        securityDeposit: 2000,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=800']
      },
      {
        title: 'Steam Deck OLED 1TB Handheld',
        description: '7.4" HDR OLED display handheld gaming PC. Streamlined AMD APU with 16GB RAM and carrying case.',
        owner: rsUser._id,
        category: getCatId('gaming'),
        brand: 'Valve',
        model: 'Steam Deck OLED',
        condition: 'new',
        location: 'Koramangala, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 400,
        securityDeposit: 1800,
        lateFee: 40,
        images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800']
      },
      {
        title: 'Thrustmaster T300 RS GT Racing Wheel',
        description: 'Dual-belt force feedback racing wheel with 3-pedal set. Officially licensed for PS5/PS4 and PC.',
        owner: testVendor._id,
        category: getCatId('gaming'),
        brand: 'Thrustmaster',
        model: 'T300 RS GT',
        condition: 'good',
        location: 'Indiranagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 350,
        securityDeposit: 1500,
        lateFee: 35,
        images: ['https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800']
      },
      {
        title: 'ASUS ROG Swift 360Hz Gaming Monitor',
        description: '24.5-inch Full HD gaming monitor with 360Hz refresh rate, 1ms response time, and NVIDIA G-SYNC analyzer.',
        owner: rsUser._id,
        category: getCatId('gaming'),
        brand: 'ASUS',
        model: 'ROG PG259QN',
        condition: 'like-new',
        location: 'Jayanagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 500,
        securityDeposit: 2000,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800']
      },

      // === VEHICLES & BIKES (25-32) ===
      {
        title: 'BMW 5 Series Sedan (Automatic)',
        description: 'Premium luxury sedan. Impeccable drive comfort, executive styling, leather seats, and high-end audio.',
        owner: rsUser._id,
        category: getCatId('vehicles'),
        brand: 'BMW',
        model: '5 Series 2023',
        condition: 'like-new',
        location: 'Koramangala, Bangalore',
        quantity: 1, // Quantity 1 for Sold Out testing
        availableQuantity: 1,
        pricePerDay: 4999,
        securityDeposit: 15000,
        lateFee: 500,
        images: ['https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800']
      },
      {
        title: 'Royal Enfield Himalayan 450',
        description: 'Adventure tourer bike. High ground clearance, protective guards, and touring side bags pre-installed.',
        owner: rsUser._id,
        category: getCatId('vehicles'),
        brand: 'Royal Enfield',
        model: 'Himalayan 450',
        condition: 'good',
        location: 'Jayanagar, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 990,
        securityDeposit: 4000,
        lateFee: 100,
        images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800']
      },
      {
        title: 'Tesla Model 3 Long Range',
        description: 'All-electric premium sedan with autopilot. Incredible acceleration, high mileage capability, and minimal cost.',
        owner: testVendor._id,
        category: getCatId('vehicles'),
        brand: 'Tesla',
        model: 'Model 3',
        condition: 'new',
        location: 'Whitefield, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 5900,
        securityDeposit: 20000,
        lateFee: 600,
        images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=800']
      },
      {
        title: 'KTM Duke 390 Adventure Sport',
        description: 'High-performance street bike with custom riding modes, ABS control, and dual-purpose rally tires.',
        owner: testVendor._id,
        category: getCatId('vehicles'),
        brand: 'KTM',
        model: 'Duke 390',
        condition: 'good',
        location: 'Indiranagar, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 850,
        securityDeposit: 3000,
        lateFee: 90,
        images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800']
      },
      {
        title: 'Thar 4x4 Offroader (Convertible)',
        description: 'Robust off-roader vehicle ready for adventure. High-profile mud terrain tires and soft convertible top.',
        owner: rsUser._id,
        category: getCatId('vehicles'),
        brand: 'Mahindra',
        model: 'Thar 4WD',
        condition: 'good',
        location: 'Hebbal, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 2800,
        securityDeposit: 8000,
        lateFee: 300,
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800']
      },
      {
        title: 'Ather 450X Gen 3 Electric Scooter',
        description: 'Smart electric scooter with 8.4kW motor, Google Maps dashboard, and 120km real range per charge.',
        owner: rsUser._id,
        category: getCatId('vehicles'),
        brand: 'Ather',
        model: '450X',
        condition: 'like-new',
        location: 'HSR Layout, Bangalore',
        quantity: 6,
        availableQuantity: 6,
        pricePerDay: 350,
        securityDeposit: 1500,
        lateFee: 40,
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800']
      },
      {
        title: 'Trek Marlin 7 Hardtail Mountain Bike',
        description: 'Race-worthy mountain bike with front suspension fork, 10-speed Shimano drivetrain, and hydraulic brakes.',
        owner: testVendor._id,
        category: getCatId('vehicles'),
        brand: 'Trek',
        model: 'Marlin 7',
        condition: 'good',
        location: 'Whitefield, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 250,
        securityDeposit: 1000,
        lateFee: 30,
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800']
      },
      {
        title: 'Honda Activa 6G Scooter',
        description: 'Reliable city scooter with smart key technology, comfortable seating, and spacious storage holds.',
        owner: rsUser._id,
        category: getCatId('vehicles'),
        brand: 'Honda',
        model: 'Activa 6G',
        condition: 'good',
        location: 'Koramangala, Bangalore',
        quantity: 8,
        availableQuantity: 8,
        pricePerDay: 200,
        securityDeposit: 800,
        lateFee: 25,
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800']
      },

      // === FITNESS & GYM (33-40) ===
      {
        title: 'Heavy Duty Motorized Treadmill 4HP',
        description: 'Commercial grade motorized treadmill with auto-incline, heart rate sensors, and custom running modes.',
        owner: rsUser._id,
        category: getCatId('fitness-gym'),
        brand: 'FitKit',
        model: 'FK9500',
        condition: 'good',
        location: 'Koramangala, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 490,
        securityDeposit: 2500,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800']
      },
      {
        title: 'Bowflex SelectTech Adjustable Dumbbells',
        description: 'Combines 15 sets of weights into one. Adjusts from 5 lbs up to 52.5 lbs with a simple dial turn.',
        owner: testVendor._id,
        category: getCatId('fitness-gym'),
        brand: 'Bowflex',
        model: '552i Combo',
        condition: 'like-new',
        location: 'Jayanagar, Bangalore',
        quantity: 5,
        availableQuantity: 5,
        pricePerDay: 250,
        securityDeposit: 1200,
        lateFee: 30,
        images: ['https://images.unsplash.com/photo-1638558010764-9225786792c2?w=800']
      },
      {
        title: 'Commercial Spinning Bike',
        description: 'Heavy flywheel stationary gym bike with magnetic resistance and adjustable racing handlebars.',
        owner: rsUser._id,
        category: getCatId('fitness-gym'),
        brand: 'Decathlon',
        model: 'Domyos S1',
        condition: 'good',
        location: 'HSR Layout, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 300,
        securityDeposit: 1500,
        lateFee: 35,
        images: ['https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800']
      },
      {
        title: 'Kettlebell Strength Training Set',
        description: 'Complete cast iron kettlebell set (8kg, 12kg, 16kg, and 20kg weights) with smooth vinyl coating.',
        owner: testVendor._id,
        category: getCatId('fitness-gym'),
        brand: 'Lifelong',
        model: 'Kettle-set',
        condition: 'good',
        location: 'Whitefield, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 150,
        securityDeposit: 800,
        lateFee: 20,
        images: ['https://images.unsplash.com/photo-1638558010764-9225786792c2?w=800']
      },
      {
        title: 'Cross Trainer Elliptical Machine',
        description: 'Premium cross trainer with electronic resistance controls, LCD workout dashboard, and quiet operations.',
        owner: rsUser._id,
        category: getCatId('fitness-gym'),
        brand: 'Reebok',
        model: 'RE-Cross',
        condition: 'like-new',
        location: 'Indiranagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 450,
        securityDeposit: 2000,
        lateFee: 45,
        images: ['https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800']
      },
      {
        title: 'Body-Solid Adjustable Bench Press',
        description: 'Multi-position weight bench offering flat, incline, and decline options. Max capacity 400kg.',
        owner: rsUser._id,
        category: getCatId('fitness-gym'),
        brand: 'Body-Solid',
        model: 'BS-Bench',
        condition: 'good',
        location: 'Jayanagar, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 200,
        securityDeposit: 1000,
        lateFee: 20,
        images: ['https://images.unsplash.com/photo-1638558010764-9225786792c2?w=800']
      },
      {
        title: 'Power Tower Pull-Up Station',
        description: 'Sturdy steel power tower for chin-ups, pull-ups, dips, leg raises, and push-ups. Adjustable height.',
        owner: testVendor._id,
        category: getCatId('fitness-gym'),
        brand: 'Kore',
        model: 'PT-100',
        condition: 'good',
        location: 'Whitefield, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 180,
        securityDeposit: 800,
        lateFee: 20,
        images: ['https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800']
      },
      {
        title: 'Premium Yoga & Pilates Mat Set',
        description: 'High-density 10mm foam yoga mat with carry strap, two foam yoga blocks, and resistance loop bands.',
        owner: rsUser._id,
        category: getCatId('fitness-gym'),
        brand: 'Decathlon',
        model: 'Domyos-Yoga',
        condition: 'new',
        location: 'Koramangala, Bangalore',
        quantity: 10,
        availableQuantity: 10,
        pricePerDay: 80,
        securityDeposit: 400,
        lateFee: 10,
        images: ['https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800']
      },

      // === HOME & FURNITURE (41-48) ===
      {
        title: 'Herman Miller Aeron Office Chair',
        description: 'The Gold Standard ergonomic office chair. Adjustable posturefit lumbar support and breathable Pellicle mesh.',
        owner: rsUser._id,
        category: getCatId('home-furniture'),
        brand: 'Herman Miller',
        model: 'Aeron Size B',
        condition: 'like-new',
        location: 'Koramangala, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 390,
        securityDeposit: 2000,
        lateFee: 40,
        images: ['https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800']
      },
      {
        title: 'Solid Oak Wood Dining Table (6-Seater)',
        description: 'Premium rustic oak dining table with six matching cushioned wooden chairs. Elegant natural oil finish.',
        owner: testVendor._id,
        category: getCatId('home-furniture'),
        brand: 'IKEA',
        model: 'MOCKBY 6',
        condition: 'good',
        location: 'Whitefield, Bangalore',
        quantity: 1, // Quantity 1 for Sold Out testing
        availableQuantity: 1,
        pricePerDay: 800,
        securityDeposit: 3000,
        lateFee: 80,
        images: ['https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800']
      },
      {
        title: 'Leather Chesterfield Sofa (3-Seater)',
        description: 'Classic Chesterfield couch upholstered in vintage brown leather. Button-tufted padding and rolled arms.',
        owner: rsUser._id,
        category: getCatId('home-furniture'),
        brand: 'SofaCraft',
        model: 'Chesterfield 3',
        condition: 'good',
        location: 'Jayanagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 1100,
        securityDeposit: 5000,
        lateFee: 120,
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800']
      },
      {
        title: 'King Size Engineered Wood Bed Frame',
        description: 'Sturdy king-size bed frame with storage compartments underneath. Memory foam mattress can be bundled.',
        owner: testVendor._id,
        category: getCatId('home-furniture'),
        brand: 'Pepperfry',
        model: 'King-Storage',
        condition: 'good',
        location: 'HSR Layout, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 600,
        securityDeposit: 2500,
        lateFee: 60,
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800']
      },
      {
        title: 'Dyson Purifier Hot+Cool Air Purifier',
        description: 'Smart air purifier, heater, and fan all in one. HEPA filter captures 99.97% of allergens and pollutants.',
        owner: rsUser._id,
        category: getCatId('home-furniture'),
        brand: 'Dyson',
        model: 'HP07',
        condition: 'like-new',
        location: 'Koramangala, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 500,
        securityDeposit: 2000,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800']
      },
      {
        title: 'Marshall Stanmore II Bluetooth Speaker',
        description: 'Classic Marshall design wireless speaker producing rich, powerful audio. Top control knobs for custom tuning.',
        owner: rsUser._id,
        category: getCatId('home-furniture'),
        brand: 'Marshall',
        model: 'Stanmore II',
        condition: 'good',
        location: 'Indiranagar, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 350,
        securityDeposit: 1500,
        lateFee: 35,
        images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800']
      },
      {
        title: 'Adjustable Standing Desk (Dual Motor)',
        description: 'Electric sit-to-stand computer desk with memory presets, wood top, and heavy-duty steel frame supports.',
        owner: testVendor._id,
        category: getCatId('home-furniture'),
        brand: 'ErgoSmart',
        model: 'ES-Dual',
        condition: 'new',
        location: 'Whitefield, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 300,
        securityDeposit: 1200,
        lateFee: 30,
        images: ['https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800']
      },
      {
        title: 'Kitchen Aid Artisan Stand Mixer',
        description: '5-quart professional tilt-head stand mixer. Comes with flat beater, dough hook, and wire whip.',
        owner: rsUser._id,
        category: getCatId('home-furniture'),
        brand: 'Kitchen Aid',
        model: 'Artisan 5Q',
        condition: 'good',
        location: 'Jayanagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 400,
        securityDeposit: 1500,
        lateFee: 40,
        images: ['https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800']
      },

      // === APPAREL & CLOTHING (49-56) ===
      {
        title: 'Black Italian Slim Fit Tuxedo',
        description: 'Luxury wool three-piece tuxedo suit, ideal for formal black-tie events, galas, and weddings. Tailored fit.',
        owner: rsUser._id,
        category: getCatId('apparel-clothing'),
        brand: 'Armani',
        model: 'Classic Tuxedo',
        condition: 'like-new',
        location: 'Koramangala, Bangalore',
        quantity: 4,
        availableQuantity: 4,
        pricePerDay: 799,
        securityDeposit: 3000,
        lateFee: 100,
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800']
      },
      {
        title: 'Designer Evening Party Silk Dress',
        description: 'Elegant designer floor-length silk gown. Exquisite embroidery details and adjustable waist corset cords.',
        owner: testVendor._id,
        category: getCatId('apparel-clothing'),
        brand: 'Sabyasachi',
        model: 'Silk Evening Gown',
        condition: 'like-new',
        location: 'Indiranagar, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 899,
        securityDeposit: 3500,
        lateFee: 100,
        images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800']
      },
      {
        title: 'Sherwani Set for Wedding (Maroon)',
        description: 'Rich maroon ethnic Sherwani set complete with matching Churidar pants, stole, and traditional turban.',
        owner: rsUser._id,
        category: getCatId('apparel-clothing'),
        brand: 'Manyavar',
        model: 'Groom Sherwani',
        condition: 'good',
        location: 'Jayanagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 999,
        securityDeposit: 4000,
        lateFee: 120,
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800']
      },
      {
        title: 'Professional Leather Riding Jacket',
        description: 'Genuine cowhide leather motorcycle jacket with built-in CE approved elbow and shoulder protection armor.',
        owner: testVendor._id,
        category: getCatId('apparel-clothing'),
        brand: 'Alpinestars',
        model: 'GP Plus R V3',
        condition: 'good',
        location: 'Whitefield, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 400,
        securityDeposit: 1500,
        lateFee: 50,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800']
      },
      {
        title: 'Sony DSLR Heavy Duty Camera Backpack',
        description: 'Weatherproof camera backpack designed to hold 2 DSLR bodies, 5 lenses, laptop, and tripod mount.',
        owner: rsUser._id,
        category: getCatId('apparel-clothing'),
        brand: 'Lowepro',
        model: 'ProTactic 450 AW',
        condition: 'good',
        location: 'HSR Layout, Bangalore',
        quantity: 5,
        availableQuantity: 5,
        pricePerDay: 150,
        securityDeposit: 500,
        lateFee: 20,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800']
      },

      // === EVENT & PARTY GEAR (57-61) ===
      {
        title: 'Quechua 4-Person Waterproof Camping Tent',
        description: 'Spacious family camping tent featuring fresh & black technology blocks, keeping inside dark and cool.',
        owner: rsUser._id,
        category: getCatId('event-party'),
        brand: 'Quechua',
        model: 'Arpenaz 4.1',
        condition: 'good',
        location: 'Koramangala, Bangalore',
        quantity: 5,
        availableQuantity: 5,
        pricePerDay: 350,
        securityDeposit: 1500,
        lateFee: 30,
        images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800']
      },
      {
        title: 'Fog Machine / Smoke Generator 900W',
        description: 'Powerful smoke machine with remote control. Generates uniform fog for concerts, parties, and stages.',
        owner: rsUser._id,
        category: getCatId('event-party'),
        brand: 'Antari',
        model: 'F-80Z',
        condition: 'good',
        location: 'HSR Layout, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 300,
        securityDeposit: 1000,
        lateFee: 30,
        images: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800']
      },
      {
        title: 'DJ Deck Pioneer DDJ-FLX4 Controller',
        description: '2-channel DJ controller ideal for beginners and professionals. Multi-device support for Rekordbox/Serato.',
        owner: testVendor._id,
        category: getCatId('event-party'),
        brand: 'Pioneer DJ',
        model: 'DDJ-FLX4',
        condition: 'like-new',
        location: 'Indiranagar, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 800,
        securityDeposit: 3000,
        lateFee: 80,
        images: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800']
      },
      {
        title: 'Chauvet DJ GigBar 2 Lighting Rig',
        description: 'Ultimate 4-in-1 lighting system containing two LED Derby fixtures, LED pars, laser, and strobe effect bar.',
        owner: testVendor._id,
        category: getCatId('event-party'),
        brand: 'Chauvet DJ',
        model: 'GigBar 2',
        condition: 'good',
        location: 'Whitefield, Bangalore',
        quantity: 2,
        availableQuantity: 2,
        pricePerDay: 1200,
        securityDeposit: 4000,
        lateFee: 120,
        images: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800']
      },
      {
        title: 'Heavy Duty Pop-Up Gazebo Canopy Tent',
        description: '3m x 3m fully waterproof pop-up commercial gazebo. Comes with side walls and heavy sandbags bags.',
        owner: rsUser._id,
        category: getCatId('event-party'),
        brand: 'Gorilla Tents',
        model: 'Pop-Up 3x3',
        condition: 'good',
        location: 'Hebbal, Bangalore',
        quantity: 3,
        availableQuantity: 3,
        pricePerDay: 400,
        securityDeposit: 1500,
        lateFee: 40,
        images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800']
      }
    ];

    console.log(`\n📋 Preparing to seed ${productsList.length} products...`);

    // Delete existing products with matches to prevent duplicated seed run clutter
    const titles = productsList.map(p => p.title);
    await Product.deleteMany({ title: { $in: titles } });

    // Seed all products
    const inserted = await Product.insertMany(productsList);
    console.log(`✅ Successfully seeded ${inserted.length} premium equipment items across all categories!`);

    await mongoose.disconnect();
    console.log('✅ Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err.message);
    process.exit(1);
  }
}

run();
