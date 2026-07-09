import mongoose from 'mongoose';
import env from './env.js';

/**
 * Connect to MongoDB using Mongoose.
 * Logs connection success or failure and exits on critical error.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });
};

export default connectDB;
