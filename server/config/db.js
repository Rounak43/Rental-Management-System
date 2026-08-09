import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rental-system';

  const attemptConnect = async () => {
    if (mongoose.connection.readyState === 1) return;

    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ Database connection error: ${error.message}`);
      console.error(`⚠️ Retrying MongoDB connection in 5 seconds...`);
      setTimeout(attemptConnect, 5000);
    }
  };

  await attemptConnect();
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Retrying...');
  setTimeout(() => {
    if (mongoose.connection.readyState === 0) {
      connectDB();
    }
  }, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

export default connectDB;


