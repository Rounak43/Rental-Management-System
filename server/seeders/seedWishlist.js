import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const seedWishlist = async () => {
  console.log('🌱 [6/7] Seeding 600 Customer Wishlist Documents...');

  const customers = await User.find({ role: 'customer' }).limit(600);
  const products = await Product.find().select('_id');

  if (customers.length === 0 || products.length === 0) {
    throw new Error('Customers or Products missing for seeding wishlist');
  }

  const wishlistDocs = [];
  const productIds = products.map(p => p._id);

  for (const customer of customers) {
    const itemCount = faker.number.int({ min: 1, max: 8 });
    const selectedProds = faker.helpers.arrayElements(productIds, itemCount);

    wishlistDocs.push({
      user: customer._id,
      products: selectedProds,
      createdAt: faker.date.past({ years: 1 }),
    });
  }

  await Wishlist.insertMany(wishlistDocs);
  const totalWishlists = await Wishlist.countDocuments();
  console.log(`✅ Wishlists (${totalWishlists}) seeded successfully!`);
};
