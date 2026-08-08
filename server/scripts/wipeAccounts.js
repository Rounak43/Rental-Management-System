import connectDB from '../config/db.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const wipeAccounts = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Deleting customer and vendor accounts...');
    
    const result = await User.deleteMany({ role: { $in: ['customer', 'vendor'] } });
    console.log(`Successfully deleted ${result.deletedCount} customer/vendor accounts from MongoDB.`);
    
    // Check remaining users
    const remainingUsers = await User.find({});
    console.log('Remaining users in database:', remainingUsers);
    
    process.exit(0);
  } catch (error) {
    console.error('Error wiping accounts:', error);
    process.exit(1);
  }
};

wipeAccounts();
