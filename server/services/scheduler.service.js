import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import Menu from '../models/Menu.js';
import { autoResolvePastOrders } from '../utils/autoResolveOrders.js';

/**
 * Scheduler service using node-cron.
 * Runs daily jobs to auto-generate orders from active subscriptions.
 */

/**
 * Generate orders for tomorrow from all active subscriptions.
 * Skips subscriptions that have tomorrow in their pausedDates.
 */
const generateDailyOrders = async () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  console.log(`\n🕛 [Scheduler] Running daily order generation for ${tomorrow.toDateString()}`);

  try {
    // Find active subscriptions that cover tomorrow
    const subscriptions = await Subscription.find({
      status: 'active',
      startDate: { $lte: tomorrowEnd },
      endDate: { $gte: tomorrow },
    }).populate('user');

    let ordersCreated = 0;
    let ordersSkipped = 0;

    for (const sub of subscriptions) {
      // Check if tomorrow is a paused date
      const isPaused = sub.pausedDates.some((d) => {
        const pausedDate = new Date(d);
        pausedDate.setHours(0, 0, 0, 0);
        return pausedDate.getTime() === tomorrow.getTime();
      });

      if (isPaused) {
        ordersSkipped++;
        continue;
      }

      // Determine which meal types to generate
      const mealTypes = sub.mealType === 'both'
        ? ['lunch', 'dinner']
        : [sub.mealType];

      for (const mealType of mealTypes) {
        // Check if order already exists for this user, date, mealType
        const existingOrder = await Order.findOne({
          user: sub.user._id,
          date: { $gte: tomorrow, $lte: tomorrowEnd },
          mealType,
        });

        if (existingOrder) {
          ordersSkipped++;
          continue;
        }

        // Find menu for tomorrow
        const menu = await Menu.findOne({
          date: { $gte: tomorrow, $lte: tomorrowEnd },
          mealType,
          isPublished: true,
        });

        const order = await Order.create({
          user: sub.user._id,
          subscription: sub._id,
          menu: menu?._id || null,
          date: tomorrow,
          mealType,
          status: 'scheduled',
          deliveryAddress: sub.deliveryAddress,
        });

        if (order) ordersCreated++;
      }
    }

    console.log(`✅ [Scheduler] Orders generated: ${ordersCreated}, Skipped: ${ordersSkipped}`);
  } catch (error) {
    console.error('❌ [Scheduler] Error generating daily orders:', error.message);
  }
};

/**
 * Expire subscriptions that have passed their endDate.
 */
const expireSubscriptions = async () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  try {
    const result = await Subscription.updateMany(
      {
        status: 'active',
        endDate: { $lt: now },
      },
      { $set: { status: 'expired' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`📅 [Scheduler] Expired ${result.modifiedCount} subscription(s)`);
    }
  } catch (error) {
    console.error('❌ [Scheduler] Error expiring subscriptions:', error.message);
  }
};

/**
 * Initialize the cron scheduler.
 * - Daily at midnight (00:00): generate orders for tomorrow
 * - Daily at 00:05: expire old subscriptions
 */
export const initScheduler = () => {
  // Run daily at midnight IST
  cron.schedule('0 0 * * *', async () => {
    await generateDailyOrders();
    await autoResolvePastOrders();
  }, {
    timezone: 'Asia/Kolkata',
  });

  // Run daily at 00:05 IST
  cron.schedule('5 0 * * *', async () => {
    await expireSubscriptions();
  }, {
    timezone: 'Asia/Kolkata',
  });

  console.log('⏰ Scheduler initialized: daily order generation (00:00 IST), subscription expiry (00:05 IST)');
};

// Export for manual invocation (testing/seeding)
export { generateDailyOrders, expireSubscriptions };
