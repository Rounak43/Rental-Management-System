import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const seedReviews = async () => {
  console.log('🌱 [5/7] Seeding 3,000 Reviews & Updating Product Ratings...');

  const customers = await User.find({ role: 'customer' });
  const products = await Product.find();

  if (customers.length === 0 || products.length === 0) {
    throw new Error('Customers or Products missing for seeding reviews');
  }

  const reviewDocs = [];
  const prodRatingMap = {};

  for (let i = 0; i < 3000; i++) {
    const product = products[i % products.length];
    const customer = customers[i % customers.length];
    const rating = faker.number.int({ min: 3, max: 5 });
    const comment = faker.helpers.arrayElement([
      'Excellent equipment! Arrived in pristine condition and worked flawlessly.',
      'Super easy pickup and return process. Highly recommended vendor!',
      'Good quality product, well maintained and battery backup was great.',
      'Awesome experience renting this gear. Will definitely rent again!',
      'Decent condition. All cables and accessories were included as described.',
      'Saved me thousands compared to buying new! Great marketplace service.',
    ]);

    reviewDocs.push({
      product: product._id,
      user: customer._id,
      rating,
      comment,
      isVerifiedPurchase: true,
      createdAt: faker.date.past({ years: 2 }),
    });

    if (!prodRatingMap[product._id.toString()]) {
      prodRatingMap[product._id.toString()] = { sum: 0, count: 0 };
    }
    prodRatingMap[product._id.toString()].sum += rating;
    prodRatingMap[product._id.toString()].count += 1;
  }

  await Review.insertMany(reviewDocs);

  // Update Product aggregate ratings & reviewCounts in batch
  const bulkOps = [];
  for (const [prodId, data] of Object.entries(prodRatingMap)) {
    const avgRating = Number((data.sum / data.count).toFixed(1));
    bulkOps.push({
      updateOne: {
        filter: { _id: prodId },
        update: { rating: avgRating, reviewCount: data.count }
      }
    });
  }

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  const totalReviews = await Review.countDocuments();
  console.log(`✅ Reviews (${totalReviews}) seeded successfully & Product Ratings updated!`);
};
