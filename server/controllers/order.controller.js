import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import Menu from '../models/Menu.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Get current user's orders with pagination
 * @route   GET /api/orders?page=1&limit=10&status=delivered
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.mealType) filter.mealType = req.query.mealType;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('menu', 'items mealType')
        .populate('deliveryPartner', 'name phone'),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a specific order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: req.user._id })
      .populate('menu')
      .populate('subscription', 'plan mealType dietType')
      .populate('deliveryPartner', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's order(s) for the current user
 * @route   GET /api/orders/today
 * @access  Private
 */
export const getTodaysOrder = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.find({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate('menu')
      .populate('deliveryPartner', 'name phone');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (admin/delivery partner)
 * @route   PATCH /api/orders/:id/status
 * @access  Admin / Delivery
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Validate status transitions
    const statusFlow = {
      scheduled: ['preparing', 'cancelled'],
      preparing: ['out_for_delivery', 'cancelled'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    if (!statusFlow[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${order.status}' to '${status}'.`,
      });
    }

    order.status = status;

    // If delivered, update subscription mealsDelivered
    if (status === 'delivered' && order.subscription) {
      const subscription = await Subscription.findById(order.subscription);
      if (subscription) {
        subscription.mealsDelivered += 1;
        subscription.mealsRemaining = subscription.totalMeals - subscription.mealsDelivered;
        await subscription.save();
      }
    }

    await order.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.user.toString()}`).emit('orderStatusUpdate', {
        orderId: order._id,
        status: order.status,
        updatedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit feedback for a delivered order
 * @route   POST /api/orders/:id/feedback
 * @access  Private
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required and must be between 1 and 5.',
      });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for delivered orders.',
      });
    }

    if (order.feedback && order.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted for this order.',
      });
    }

    order.feedback = {
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date(),
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a one-off order (single meal purchase)
 * @route   POST /api/orders
 * @access  Private
 */
export const createOneOffOrder = async (req, res, next) => {
  try {
    const { menuId, itemIds, addressId } = req.body;

    if (!menuId || !addressId) {
      return res.status(400).json({
        success: false,
        message: 'Menu ID and Address ID are required.',
      });
    }

    // 1. Fetch menu details
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found.',
      });
    }

    // 2. Fetch user's address details
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    // 3. Check price of selected items
    let cost = 0;
    let orderItems = [];

    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      const selectedItems = menu.items.filter(item => itemIds.includes(item._id.toString()));
      cost = selectedItems.reduce((sum, item) => sum + (item.price || 6000), 0);
      orderItems = selectedItems.map(item => ({
        itemId: item._id,
        name: item.name,
        price: item.price || 6000
      }));
    } else {
      cost = menu.price?.single || 12000;
      orderItems = menu.items.map(item => ({
        itemId: item._id,
        name: item.name,
        price: item.price || 6000
      }));
    }

    if (!cost || cost <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Order price could not be determined.',
      });
    }

    // 4. Verify wallet balance
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < cost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance. Please add funds first.',
      });
    }

    // 5. Deduct cost from wallet
    await wallet.debit(
      cost,
      `Single meal order: ${orderItems.map(i => i.name).join(', ')}`,
      `order_purchase_${Date.now()}`
    );

    // 6. Create order
    const order = await Order.create({
      user: req.user._id,
      menu: menuId,
      items: orderItems,
      totalAmount: cost,
      date: menu.date,
      mealType: menu.mealType,
      status: 'scheduled',
      deliveryAddress: {
        label: address.label,
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        pincode: address.pincode,
        coordinates: address.coordinates,
      },
    });

    // 7. Create notification
    try {
      await Notification.create({
        user: req.user._id,
        title: 'Order Placed',
        message: `Your meal order containing ${orderItems.length} item(s) has been scheduled.`,
      });
    } catch (notifErr) {
      console.error('Failed to create order notification:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed and paid successfully!',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
