import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-system';

const productSchema = new mongoose.Schema({
  isPublished: Boolean
});
const Product = mongoose.model('Product', productSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const res = await Product.updateMany({}, { isPublished: true });
  console.log('✅ Successfully published:', res.modifiedCount || res.nModified || 'all', 'products');
  await mongoose.disconnect();
}
run();
