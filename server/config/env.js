import dotenv from 'dotenv';
dotenv.config();

/**
 * Centralized environment configuration.
 * All env vars are exported with sensible defaults.
 */
const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/dailybite',
  JWT_SECRET: process.env.JWT_SECRET || 'dailybite_dev_secret_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  OTP_EXPIRY: parseInt(process.env.OTP_EXPIRY, 10) || 5,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL || '',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

export default env;
