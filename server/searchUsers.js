import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-system';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});
const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({
    $or: [
      { email: /rs/i },
      { email: /coder/i },
      { name: /rs/i },
      { name: /coder/i }
    ]
  });
  console.log(users.map(u => ({ email: u.email, role: u.role, name: u.name })));
  await mongoose.disconnect();
}
run();
