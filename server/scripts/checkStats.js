import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dailybite');
  console.log('Connected to MongoDB');

  const orders = await Order.find({});
  console.log(`Total Orders: ${orders.length}`);
  orders.forEach((o, idx) => {
    console.log(`Order ${idx + 1}: ID=${o._id}, Date=${o.date.toISOString()}, Status=${o.status}`);
  });

  const today = new Date();
  today.setHours(0,0,0,0);
  console.log(`Today calculated: ${today.toISOString()} (${today.toString()})`);

  await mongoose.disconnect();
};

run().catch(console.error);
