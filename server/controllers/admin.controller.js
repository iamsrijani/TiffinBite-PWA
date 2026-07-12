import User from '../models/User.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import Wallet from '../models/Wallet.js';
import Menu from '../models/Menu.js';
import Notification from '../models/Notification.js';

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
      oneOffOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Subscription.countDocuments({ status: 'active' }),
      Order.find({ date: { $gte: today, $lt: tomorrow } }).populate('menu'),
      Subscription.find({ status: { $in: ['active', 'expired', 'cancelled'] } }),
      Order.find({ subscription: { $exists: false } }),
    ]);

    // Today's order breakdown
    let todayVeg = 0;
    let todayNonveg = 0;
    let todayVegan = 0;

    todayOrders.forEach(o => {
      if (o.items && o.items.length > 0) {
        o.items.forEach(item => {
          const menuItem = o.menu?.items?.find(mi => mi.name === item.name);
          const cat = menuItem?.category || item.category || 'veg';
          if (cat === 'veg') todayVeg++;
          else if (cat === 'nonveg') todayNonveg++;
          else if (cat === 'vegan') todayVegan++;
        });
      } else if (o.menu && o.menu.items) {
        o.menu.items.forEach(item => {
          if (item.category === 'veg') todayVeg++;
          else if (item.category === 'nonveg') todayNonveg++;
          else if (item.category === 'vegan') todayVegan++;
        });
      }
    });

    // Revenue calculation (subscriptions + one-off orders)
    const subRevenue = allSubscriptions.reduce((sum, sub) => sum + (sub.amountPaid || 0), 0);
    const oneOffRevenue = oneOffOrders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
    const totalRevenue = subRevenue + oneOffRevenue;

    // Today's order status breakdown
    const orderStatusBreakdown = {
      scheduled: todayOrders.filter((o) => o.status === 'scheduled').length,
      preparing: todayOrders.filter((o) => o.status === 'preparing').length,
      out_for_delivery: todayOrders.filter((o) => o.status === 'out_for_delivery').length,
      delivered: todayOrders.filter((o) => o.status === 'delivered').length,
      cancelled: todayOrders.filter((o) => o.status === 'cancelled').length,
    };

    res.status(200).json({
      success: true,
      data: {
        totalUsers: totalCustomers || totalUsers, // Align with Dashboard.jsx card text (TOTAL CUSTOMERS)
        activeSubscriptions,
        todayOrdersCount: todayOrders.length,
        totalRevenue,
        dietSplit: {
          veg: todayVeg,
          nonveg: todayNonveg,
          vegan: todayVegan,
        },
        statusSplit: orderStatusBreakdown,
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
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    // 1. Find all scheduled orders for tomorrow
    const orders = await Order.find({
      date: { $gte: tomorrow, $lt: tomorrowEnd },
      status: { $ne: 'cancelled' }
    })
    .populate('user', 'name phone email')
    .populate('deliveryPartner', 'name phone')
    .populate('menu')
    .populate('subscription');

    // 2. Count statistics from these orders
    let totalOrders = orders.length;
    let lunchCount = 0;
    let dinnerCount = 0;

    let dietSplit = { veg: 0, nonveg: 0, vegan: 0 };
    let pincodeGroups = {};

    orders.forEach(o => {
      // Meal type count
      if (o.mealType === 'lunch') lunchCount++;
      if (o.mealType === 'dinner') dinnerCount++;

      // Diet split count
      let diet = 'veg'; // default fallback
      if (o.items && o.items.length > 0) {
        const menuItem = o.menu?.items?.find(mi => mi.name === o.items[0].name);
        diet = menuItem?.category || 'veg';
      } else if (o.subscription?.dietType) {
        diet = o.subscription.dietType;
      } else if (o.menu && o.menu.items && o.menu.items.length > 0) {
        diet = o.menu.items[0].category || 'veg';
      }
      dietSplit[diet] = (dietSplit[diet] || 0) + 1;

      // Pincode grouping
      const pin = o.deliveryAddress?.pincode || 'Unknown';
      pincodeGroups[pin] = (pincodeGroups[pin] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        date: tomorrow.toISOString().split('T')[0],
        totalOrders,
        lunchCount,
        dinnerCount,
        dietSplit,
        pincodeGroups,
        orders,
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
    const { search, role } = req.query;

    const filter = { role: role || 'customer' };

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

    // Save notification for customer
    try {
      await Notification.create({
        user: userId,
        title: 'Wallet Refunded',
        message: `₹${(amount / 100).toFixed(2)} refund credited to your wallet for: ${reason || 'Service refund'}.`,
      });
    } catch (notifErr) {
      console.error('Failed to create refund notification:', notifErr);
    }

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
    let { deliveryPartnerId, orderIds, orderId } = req.body;

    if (!orderIds && orderId) {
      orderIds = [orderId];
    }

    if (!deliveryPartnerId || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'deliveryPartnerId and orderId (or array of orderIds) are required.',
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
