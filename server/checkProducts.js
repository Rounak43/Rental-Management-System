import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-system';

const productSchema = new mongoose.Schema({
  title: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  availability: Boolean,
  availableQuantity: Number
});
const Product = mongoose.model('Product', productSchema);

const userSchema = new mongoose.Schema({
  email: String,
  name: String
});
const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const products = await Product.find({}).populate('owner', 'email name');
  console.log(products.map(p => ({
    title: p.title,
    ownerEmail: p.owner?.email,
    ownerName: p.owner?.name,
    availableQuantity: p.availableQuantity,
    availability: p.availability
  })));
  await mongoose.disconnect();
}
run();
