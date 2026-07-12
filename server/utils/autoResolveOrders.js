import Order from '../models/Order.js';

export const autoResolvePastOrders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Order.updateMany(
      {
        date: { $lt: today },
        status: { $in: ['scheduled', 'preparing', 'out_for_delivery'] }
      },
      {
        $set: { status: 'delivered' }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`🧹 [Auto-Resolve] Marked ${result.modifiedCount} past pending order(s) as delivered.`);
    }
  } catch (err) {
    console.error('❌ [Auto-Resolve] Error resolving past orders:', err.message);
  }
};
