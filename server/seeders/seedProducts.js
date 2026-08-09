import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const CATEGORY_NAMES = [
  'Electronics & Tech',
  'Gaming & Consoles',
  'Cameras & Photography',
  'Gym & Fitness Equipment',
  'Home & Furniture',
  'Tools & Hardware',
  'Vehicles & Bikes',
  'Medical & Healthcare',
  'Construction Equipment',
  'Musical Instruments',
  'Event & Staging Gear',
  'Camping & Outdoor',
  'Professional Photography',
  'Office Equipment',
  'Home Appliances',
  'Apparel & Fashion',
  'Sports Equipment',
  'Kitchen Equipment',
  'Party Equipment',
  'Accessories & Wearables',
];

const CATEGORY_IMAGE_POOLS = {
  'Electronics & Tech': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
  ],
  'Gaming & Consoles': [
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
    'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800',
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800',
    'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=800',
    'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800',
  ],
  'Cameras & Photography': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800',
  ],
  'Gym & Fitness Equipment': [
    'https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
  ],
  'Home & Furniture': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1580481072645-022f9a6d1276?w=800',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800',
  ],
  'Tools & Hardware': [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800',
  ],
  'Vehicles & Bikes': [
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
  ],
  'Medical & Healthcare': [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
  ],
  'Construction Equipment': [
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
  ],
  'Musical Instruments': [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800',
  ],
  'Event & Staging Gear': [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
  ],
  'Camping & Outdoor': [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
  ],
  'Professional Photography': [
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  ],
  'Office Equipment': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
  ],
  'Home Appliances': [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800',
  ],
  'Apparel & Fashion': [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
  ],
  'Sports Equipment': [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800',
  ],
  'Kitchen Equipment': [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800',
  ],
  'Party Equipment': [
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
  ],
  'Accessories & Wearables': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
  ],
};

const SPECIFIC_VENDOR_PRODUCTS = {
  'rounaks135@gmail.com': [
    { title: 'RED Komodo 6K Cinema Camera Package', category: 'Cameras & Photography', price: 2500, deposit: 12000, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800' },
    { title: 'Sony FX3 Full-Frame Cinema Line Camera', category: 'Cameras & Photography', price: 1800, deposit: 8000, img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800' },
    { title: 'Apple MacBook Pro 16" M3 Max 64GB', category: 'Electronics & Tech', price: 1900, deposit: 9000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' },
    { title: 'DJI Mavic 3 Pro Cine Premium Combo', category: 'Cameras & Photography', price: 2200, deposit: 10000, img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800' },
    { title: 'Sony PlayStation 5 Slim VR2 Gaming Bundle', category: 'Gaming & Consoles', price: 700, deposit: 3500, img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800' },
    { title: 'Ather 450X Gen 3 Electric Scooter', category: 'Vehicles & Bikes', price: 850, deposit: 4000, img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800' },
    { title: 'Commercial Motorized Treadmill 5.0 HP', category: 'Gym & Fitness Equipment', price: 950, deposit: 4500, img: 'https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800' },
    { title: 'Sennheiser Wireless Lavalier Mic System', category: 'Event & Staging Gear', price: 450, deposit: 2000, img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800' },
    { title: 'DeWalt 20V Cordless Power Tool Combo', category: 'Tools & Hardware', price: 350, deposit: 1500, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800' },
    { title: 'Bose S1 Pro+ Portable PA Sound System', category: 'Event & Staging Gear', price: 600, deposit: 3000, img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800' },
  ],
  'rohitsharma54997@gmail.com': [
    { title: 'Canon EOS R5 8K Mirrorless Camera Kit', category: 'Cameras & Photography', price: 2100, deposit: 9500, img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800' },
    { title: 'Sony FE 24-70mm f/2.8 GM II Lens', category: 'Professional Photography', price: 800, deposit: 4000, img: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800' },
    { title: 'Godox AD600Pro Studio Flash Light Set', category: 'Professional Photography', price: 900, deposit: 4500, img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800' },
    { title: 'Xbox Series X 1TB Console + 2 Controllers', category: 'Gaming & Consoles', price: 650, deposit: 3000, img: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800' },
    { title: 'Royal Enfield Hunter 350 Dapper Grey', category: 'Vehicles & Bikes', price: 1100, deposit: 5000, img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800' },
    { title: 'Meta Quest 3 VR Headset 512GB', category: 'Gaming & Consoles', price: 800, deposit: 3800, img: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=800' },
    { title: 'Aputure LS 600d Pro Daylight LED Light', category: 'Professional Photography', price: 1400, deposit: 6000, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800' },
    { title: 'DJI RS 3 Pro Gimbal Stabilizer', category: 'Cameras & Photography', price: 650, deposit: 3000, img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800' },
  ]
};

export const seedProducts = async () => {
  console.log('🌱 [2/7] Seeding Categories & Products with Working Image URLs...');

  // 1. Seed Categories
  const categoryDocs = [];
  for (const catName of CATEGORY_NAMES) {
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const pool = CATEGORY_IMAGE_POOLS[catName] || ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'];
    categoryDocs.push({
      name: catName,
      slug,
      description: `Rent high-quality ${catName} equipment with instant vendor delivery and security coverage.`,
      isActive: true,
      image: pool[0],
    });
  }

  const seededCategories = await Category.insertMany(categoryDocs);
  const catMap = {};
  seededCategories.forEach(c => { catMap[c.name] = c._id; });

  // 2. Fetch Vendors
  const rounakVendor = await User.findOne({ email: 'rounaks135@gmail.com' });
  const rohitVendor = await User.findOne({ email: 'rohitsharma54997@gmail.com' });
  const allVendors = await User.find({ role: 'vendor' });

  if (allVendors.length === 0) throw new Error('No vendors found for seeding products');

  const productDocs = [];
  const locations = ['Koramangala, Bangalore', 'Indiranagar, Bangalore', 'Bandra West, Mumbai', 'Connaught Place, Delhi', 'HSR Layout, Bangalore', 'Gachibowli, Hyderabad', 'T. Nagar, Chennai', 'Salt Lake, Kolkata', 'Viman Nagar, Pune'];

  // Helper function to create product doc
  const buildProductDoc = (vendorId, title, catName, price, deposit, primaryImg, idx) => {
    const categoryId = catMap[catName] || catMap['Electronics & Tech'];
    const imagePool = CATEGORY_IMAGE_POOLS[catName] || ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'];
    const secondaryImg = imagePool[(idx + 1) % imagePool.length];

    const pricePerDay = price || faker.number.int({ min: 300, max: 3000 });
    const securityDeposit = deposit || pricePerDay * faker.number.int({ min: 2, max: 5 });
    const lateFeePerHour = Math.max(25, Math.round(pricePerDay / 10));
    const gracePeriod = faker.number.int({ min: 1, max: 3 });
    const maximumLateFee = lateFeePerHour * 10;
    const qty = faker.number.int({ min: 2, max: 10 });
    const currentlyRented = faker.number.int({ min: 0, max: Math.floor(qty / 2) });
    const availableQuantity = qty - currentlyRented;

    return {
      title,
      category: categoryId,
      owner: vendorId,
      description: `${title}. Premium rental package with full accessories, flight case, vendor inspection guarantee, and 24/7 technical support.`,
      condition: faker.helpers.arrayElement(['new', 'like-new', 'good']),
      pricePerDay,
      securityDeposit,
      lateFee: lateFeePerHour,
      lateFeePerHour,
      gracePeriod,
      maximumLateFee,
      quantity: qty,
      availableQuantity,
      currentlyRented,
      availability: availableQuantity > 0,
      status: 'available',
      productStatus: 'available',
      repairStatus: 'none',
      location: faker.helpers.arrayElement(locations),
      rating: Number((4.2 + Math.random() * 0.8).toFixed(1)),
      reviewCount: 0,
      isPublished: true,
      images: [primaryImg, secondaryImg],
      specifications: {
        brand: title.split(' ')[0] || faker.company.name(),
        model: faker.string.alphanumeric({ length: 6, casing: 'upper' }),
        warranty: '100% Vendor Guarantee',
        powerRating: '100-240V Universal',
      },
      createdAt: faker.date.past({ years: 2 }),
    };
  };

  let count = 0;

  // 3. Seed specific products for rounaks135@gmail.com
  if (rounakVendor) {
    SPECIFIC_VENDOR_PRODUCTS['rounaks135@gmail.com'].forEach((p, idx) => {
      count++;
      productDocs.push(buildProductDoc(rounakVendor._id, p.title, p.category, p.price, p.deposit, p.img, idx));
    });
    // Add additional products across all categories for rounaks135@gmail.com
    CATEGORY_NAMES.forEach((catName, idx) => {
      count++;
      const pool = CATEGORY_IMAGE_POOLS[catName];
      const img = pool[idx % pool.length];
      productDocs.push(buildProductDoc(rounakVendor._id, `Pro ${catName} Rental Kit #${idx + 1}`, catName, 400 + idx * 50, 1500 + idx * 200, img, idx));
    });
  }

  // 4. Seed specific products for rohitsharma54997@gmail.com
  if (rohitVendor) {
    SPECIFIC_VENDOR_PRODUCTS['rohitsharma54997@gmail.com'].forEach((p, idx) => {
      count++;
      productDocs.push(buildProductDoc(rohitVendor._id, p.title, p.category, p.price, p.deposit, p.img, idx));
    });
    // Add additional products across all categories for rohitsharma54997@gmail.com
    CATEGORY_NAMES.forEach((catName, idx) => {
      count++;
      const pool = CATEGORY_IMAGE_POOLS[catName];
      const img = pool[(idx + 1) % pool.length];
      productDocs.push(buildProductDoc(rohitVendor._id, `Elite ${catName} Gear #${idx + 1}`, catName, 450 + idx * 60, 1800 + idx * 250, img, idx));
    });
  }

  // 5. Seed products for all other vendors across all 20 categories
  let vendorIdx = 0;
  while (productDocs.length < 500) {
    const vendor = allVendors[vendorIdx % allVendors.length];
    const catName = CATEGORY_NAMES[productDocs.length % CATEGORY_NAMES.length];
    const pool = CATEGORY_IMAGE_POOLS[catName] || ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'];
    const img = pool[productDocs.length % pool.length];
    const title = `${catName} Professional Setup #${productDocs.length + 1}`;

    productDocs.push(buildProductDoc(vendor._id, title, catName, null, null, img, productDocs.length));
    vendorIdx++;
  }

  await Product.insertMany(productDocs);
  const totalProducts = await Product.countDocuments();

  if (rounakVendor) {
    const rounakCount = await Product.countDocuments({ owner: rounakVendor._id });
    console.log(`📸 rounaks135@gmail.com owns ${rounakCount} products.`);
  }
  if (rohitVendor) {
    const rohitCount = await Product.countDocuments({ owner: rohitVendor._id });
    console.log(`📸 rohitsharma54997@gmail.com owns ${rohitCount} products.`);
  }

  console.log(`✅ Categories (${seededCategories.length}) & Products (${totalProducts}) seeded successfully with working photos!`);
};
