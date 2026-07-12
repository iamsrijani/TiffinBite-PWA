import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dailybite');
  console.log('Connected to MongoDB');

  const subs = await Subscription.find({});
  console.log(`Total Subscriptions in DB: ${subs.length}`);
  subs.forEach((s, idx) => {
    console.log(`Sub ${idx + 1}: ID=${s._id}, Status=${s.status}, AmountPaid=${s.amountPaid}, PausedDates=${JSON.stringify(s.pausedDates)}`);
  });

  await mongoose.disconnect();
};

run().catch(console.error);
