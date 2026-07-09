import User from '../models/User.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import Wallet from '../models/Wallet.js';
import Menu from '../models/Menu.js';

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for speed
    const [
      totalUsers,
      totalCustomers,
      activeSubscriptions,
      todayOrders,
      allSubscriptions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Subscription.countDocuments({ status: 'active' }),
      Order.find({ date: { $gte: today, $lt: tomorrow } }).populate('menu'),
      Subscription.find({ status: { $in: ['active', 'expired', 'cancelled'] } }),
    ]);

    // Today's order breakdown
    const todayVeg = todayOrders.filter((o) =>
      o.menu && o.menu.items && o.menu.items.some((i) => i.category === 'veg')
    ).length;
    const todayNonveg = todayOrders.filter((o) =>
      o.menu && o.menu.items && o.menu.items.some((i) => i.category === 'nonveg')
    ).length;

    // Revenue calculation (sum of all subscription amountPaid)
    const totalRevenue = allSubscriptions.reduce(
      (sum, sub) => sum + (sub.amountPaid || 0), 0
    );

    // Today's order status breakdown
    const orderStatusBreakdown = {
      scheduled: todayOrders.filter((o) => o.status === 'scheduled').length,
      preparing: todayOrders.filter((o) => o.status === 'preparing').length,
      outForDelivery: todayOrders.filter((o) => o.status === 'out_for_delivery').length,
      delivered: todayOrders.filter((o) => o.status === 'delivered').length,
      cancelled: todayOrders.filter((o) => o.status === 'cancelled').length,
    };

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        activeSubscriptions,
        todayOrders: {
          total: todayOrders.length,
          veg: todayVeg,
          nonveg: todayNonveg,
          statusBreakdown: orderStatusBreakdown,
        },
        revenue: {
          total: totalRevenue,
          totalInRupees: (totalRevenue / 100).toFixed(2),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order forecast for next day by type/diet/area
 * @route   GET /api/admin/forecast
 * @access  Admin
 */
export const getOrderForecast = async (req, res, next) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Active subscriptions that cover tomorrow
    const activeSubscriptions = await Subscription.find({
      status: 'active',
      startDate: { $lte: dayAfter },
      endDate: { $gte: tomorrow },
    });

    // Filter out paused subscriptions for tomorrow
    const activeSubs = activeSubscriptions.filter((sub) => {
      const isPaused = sub.pausedDates.some((d) => {
        const pd = new Date(d);
        pd.setHours(0, 0, 0, 0);
        return pd.getTime() === tomorrow.getTime();
      });
      return !isPaused;
    });

    // Count by meal type
    const byMealType = { lunch: 0, dinner: 0 };
    for (const sub of activeSubs) {
      if (sub.mealType === 'both') {
        byMealType.lunch++;
        byMealType.dinner++;
      } else {
        byMealType[sub.mealType]++;
      }
    }

    // Count by diet type
    const byDietType = { veg: 0, nonveg: 0, vegan: 0 };
    for (const sub of activeSubs) {
      byDietType[sub.dietType] = (byDietType[sub.dietType] || 0) + 1;
    }

    // Count by area (city)
    const byArea = {};
    for (const sub of activeSubs) {
      const city = sub.deliveryAddress?.city || 'Unknown';
      byArea[city] = (byArea[city] || 0) + 1;
    }

    res.status(200).json({
      success: true,
      data: {
        date: tomorrow.toISOString().split('T')[0],
        totalMeals: byMealType.lunch + byMealType.dinner,
        byMealType,
        byDietType,
        byArea,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all customers with pagination and search
 * @route   GET /api/admin/customers?page=1&limit=20&search=john
 * @access  Admin
 */
export const getAllCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const filter = { role: 'customer' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-passwordHash'),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer by ID with subscriptions and orders
 * @route   GET /api/admin/customers/:id
 * @access  Admin
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [customer, subscriptions, recentOrders, wallet] = await Promise.all([
      User.findById(id).select('-passwordHash'),
      Subscription.find({ user: id }).sort({ createdAt: -1 }),
      Order.find({ user: id }).sort({ date: -1 }).limit(20).populate('menu', 'items mealType'),
      Wallet.findOne({ user: id }),
    ]);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        customer,
        subscriptions,
        recentOrders,
        wallet: wallet
          ? {
              balance: wallet.balance,
              balanceInRupees: (wallet.balance / 100).toFixed(2),
              transactionCount: wallet.transactions.length,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Issue a refund to a user's wallet
 * @route   POST /api/admin/refund
 * @access  Admin
 */
export const issueRefund = async (req, res, next) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'userId and a positive amount (in paise) are required.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId, balance: 0, transactions: [] });
    }

    await wallet.credit(
      amount,
      `Admin refund: ${reason || 'No reason specified'}`,
      `admin_refund_${Date.now()}`
    );

    res.status(200).json({
      success: true,
      message: `₹${(amount / 100).toFixed(2)} refunded to ${user.name || user.phone}'s wallet.`,
      data: {
        userId,
        refundedAmount: amount,
        refundedAmountInRupees: (amount / 100).toFixed(2),
        newBalance: wallet.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feedback with filters
 * @route   GET /api/admin/feedback?rating=5&page=1&limit=20
 * @access  Admin
 */
export const getAllFeedback = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { 'feedback.rating': { $exists: true, $ne: null } };

    if (req.query.rating) {
      filter['feedback.rating'] = Number(req.query.rating);
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ 'feedback.createdAt': -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name phone')
        .populate('menu', 'items mealType date')
        .select('user menu date mealType feedback'),
      Order.countDocuments(filter),
    ]);

    // Average rating
    const allRatedOrders = await Order.find({
      'feedback.rating': { $exists: true, $ne: null },
    }).select('feedback.rating');

    const ratings = allRatedOrders.map((o) => o.feedback.rating);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      averageRating: Number(avgRating),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign delivery partner to orders
 * @route   POST /api/admin/assign-delivery
 * @access  Admin
 */
export const assignDeliveryPartner = async (req, res, next) => {
  try {
    const { deliveryPartnerId, orderIds } = req.body;

    if (!deliveryPartnerId || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'deliveryPartnerId and an array of orderIds are required.',
      });
    }

    // Verify delivery partner exists and has correct role
    const partner = await User.findOne({ _id: deliveryPartnerId, role: 'delivery' });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found or user is not a delivery partner.',
      });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { deliveryPartner: deliveryPartnerId } }
    );

    res.status(200).json({
      success: true,
      message: `Assigned ${result.modifiedCount} order(s) to delivery partner ${partner.name || partner.phone}.`,
      data: {
        deliveryPartner: {
          id: partner._id,
          name: partner.name,
          phone: partner.phone,
        },
        ordersAssigned: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
