import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import User from '../models/User.js';
import VendorProfile from '../models/VendorProfile.js';

export const seedUsers = async () => {
  console.log('🌱 [1/7] Seeding 250 Vendors & 750 Customers...');

  // Preserve existing admin or create default super admin
  const existingAdmin = await User.findOne({ role: 'admin' });
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  let adminUser = existingAdmin;
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@rentsphere.com',
      password: adminPasswordHash,
      role: 'admin',
      phone: '+91 98765 43210',
      isVerified: true,
      emailVerified: true,
      isActive: true,
    });
  }

  // Generate 250 Vendors
  const vendorUsersData = [];
  const vendorProfilesData = [];
  const categoriesList = [
    'Electronics & Tech', 'Gaming & Consoles', 'Cameras & Photography', 'Gym & Fitness',
    'Home & Furniture', 'Tools & Hardware', 'Vehicles & Bikes', 'Medical Equipment',
    'Construction Equipment', 'Musical Instruments', 'Event Gear', 'Camping & Outdoor',
    'Office Equipment', 'Home Appliances', 'Apparel & Fashion', 'Sports Equipment',
    'Kitchen Equipment', 'Party Equipment', 'Accessories & Wearables'
  ];

  // Primary Vendor Accounts for direct login
  const rounakPasswordHash = await bcrypt.hash('Rounak@43', 10);
  const rohitPasswordHash = await bcrypt.hash('00000000000000000', 10);
  
  const rounakVendorId = new mongoose.Types.ObjectId();
  const rohitVendorId = new mongoose.Types.ObjectId();
  
  vendorUsersData.push(
    {
      _id: rounakVendorId,
      name: 'Rounak Vendor',
      email: 'rounaks135@gmail.com',
      password: rounakPasswordHash,
      role: 'vendor',
      phone: '+91 98765 43210',
      profileImage: 'https://images.unsplash.com/photo-1535713875002?w=200',
      isVerified: true,
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
    },
    {
      _id: rohitVendorId,
      name: 'Rohit Sharma',
      email: 'rohitsharma54997@gmail.com',
      password: rohitPasswordHash,
      role: 'vendor',
      phone: '+91 98765 43211',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      isVerified: true,
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
    }
  );

  vendorProfilesData.push(
    {
      user: rounakVendorId,
      companyName: 'RentSphere Elite Rentals',
      ownerName: 'Rounak Vendor',
      gst: '29ABCDE1234F1Z5',
      businessAddress: 'Koramangala 5th Block, Bangalore, Karnataka',
      rentalCategory: 'Electronics & Tech',
      isVerified: true,
      rating: 4.9,
      completedRentals: 45,
      avatar: 'https://images.unsplash.com/photo-1535713875002?w=200',
      createdAt: new Date(),
    },
    {
      user: rohitVendorId,
      companyName: 'Rohit Tech & Gear Rentals',
      ownerName: 'Rohit Sharma',
      gst: '27ABCDE5678G1Z2',
      businessAddress: 'Bandra West, Mumbai, Maharashtra',
      rentalCategory: 'Cameras & Photography',
      isVerified: true,
      rating: 4.8,
      completedRentals: 38,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      createdAt: new Date(),
    }
  );

  for (let i = 0; i < 248; i++) {
    const userId = new mongoose.Types.ObjectId();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const companyName = `${faker.company.name()} Rentals`;

    vendorUsersData.push({
      _id: userId,
      name: `${firstName} ${lastName}`,
      email: `vendor_${i + 1}_${faker.internet.email().toLowerCase()}`,
      password: defaultPasswordHash,
      role: 'vendor',
      phone: faker.phone.number('+91 98### #####'),
      profileImage: `https://images.unsplash.com/photo-${1535713875002 + (i % 30)}?w=200`,
      isVerified: true,
      emailVerified: true,
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
    });

    vendorProfilesData.push({
      user: userId,
      companyName,
      ownerName: `${firstName} ${lastName}`,
      gst: `29${faker.string.alphanumeric({ length: 10, casing: 'upper' })}1Z5`,
      businessAddress: `${faker.location.streetAddress()}, ${faker.location.city()}`,
      rentalCategory: faker.helpers.arrayElement(categoriesList),
      isVerified: true,
      rating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
      completedRentals: faker.number.int({ min: 5, max: 200 }),
      avatar: `https://images.unsplash.com/photo-${1535713875002 + (i % 30)}?w=200`,
      createdAt: faker.date.past({ years: 2 }),
    });
  }

  // Generate 750 Customers (350 + 400 additional)
  const customerUsersData = [];
  for (let i = 0; i < 750; i++) {
    customerUsersData.push({
      name: faker.person.fullName(),
      email: `cust_${i + 1}_${faker.internet.email().toLowerCase()}`,
      password: defaultPasswordHash,
      role: 'customer',
      phone: faker.phone.number('+91 98### #####'),
      profileImage: `https://images.unsplash.com/photo-${1500648767791 + (i % 30)}?w=200`,
      isVerified: true,
      emailVerified: true,
      isActive: true,
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode('######'),
      },
      createdAt: faker.date.past({ years: 2 }),
    });
  }

  // Bulk Insert
  await User.insertMany(vendorUsersData);
  await VendorProfile.insertMany(vendorProfilesData);
  await User.insertMany(customerUsersData);

  const totalUsers = await User.countDocuments();
  const totalVendors = await User.countDocuments({ role: 'vendor' });
  const totalCustomers = await User.countDocuments({ role: 'customer' });

  console.log(`✅ Users seeded successfully! Total: ${totalUsers} | Vendors: ${totalVendors} | Customers: ${totalCustomers}`);
};
