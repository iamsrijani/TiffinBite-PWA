import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Menu from '../models/Menu.js';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import { generateDailyOrders } from '../services/scheduler.service.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dailybite');
  console.log('Connected to MongoDB');

  console.log('Triggering daily order generation for tomorrow...');
  await generateDailyOrders();
  console.log('Finished order generation successfully!');

  await mongoose.disconnect();
};

run().catch(console.error);
