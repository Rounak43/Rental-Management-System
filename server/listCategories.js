import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-system';

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String
});
const Category = mongoose.model('Category', categorySchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const cats = await Category.find({});
  console.log(cats.map(c => ({ name: c.name, slug: c.slug })));
  await mongoose.disconnect();
}
run();
