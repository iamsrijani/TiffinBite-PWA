import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';

/**
 * @desc    Get today's assigned deliveries for delivery partner
 * @route   GET /api/delivery
 * @access  Delivery
 */
export const getMyDeliveries = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.find({
      deliveryPartner: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate('user', 'name phone')
      .populate('menu', 'items mealType')
      .sort({ mealType: 1 });

    // Summary counts
    const summary = {
      total: orders.length,
      scheduled: orders.filter((o) => o.status === 'scheduled').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      outForDelivery: orders.filter((o) => o.status === 'out_for_delivery').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };

    res.status(200).json({
      success: true,
      summary,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a specific delivery order by ID
 * @route   GET /api/delivery/:id
 * @access  Delivery
 */
export const getDeliveryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      deliveryPartner: req.user._id,
    })
      .populate('user', 'name phone addresses')
      .populate('menu')
      .populate('subscription', 'plan dietType');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found or not assigned to you.',
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
 * @desc    Update delivery status
 * @route   PATCH /api/delivery/:id/status
 * @access  Delivery
 */
export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['preparing', 'out_for_delivery', 'delivered'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values for delivery: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findOne({
      _id: id,
      deliveryPartner: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found or not assigned to you.',
      });
    }

    // Validate status transitions
    const statusFlow = {
      scheduled: ['preparing'],
      preparing: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!statusFlow[order.status] || !statusFlow[order.status].includes(status)) {
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

    // Emit socket event
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
 * @desc    Submit delivery proof (image, notes, coordinates)
 * @route   POST /api/delivery/:id/proof
 * @access  Delivery
 */
export const submitDeliveryProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, lat, lng } = req.body;

    const order = await Order.findOne({
      _id: id,
      deliveryPartner: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found or not assigned to you.',
      });
    }

    // Handle uploaded image
    let imageUrl = '';
    if (req.file) {
      // In production, upload to Cloudinary or S3
      // For now, store as base64 data URI
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    order.deliveryProof = {
      image: imageUrl,
      notes: notes || '',
      timestamp: new Date(),
      coordinates: {
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
      },
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Delivery proof submitted.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get delivery partner stats
 * @route   GET /api/delivery/stats
 * @access  Delivery
 */
export const getDeliveryStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's deliveries
    const todayOrders = await Order.find({
      deliveryPartner: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    });

    // All-time stats
    const allOrders = await Order.find({
      deliveryPartner: req.user._id,
    });

    const deliveredOrders = allOrders.filter((o) => o.status === 'delivered');
    const ratingsArr = deliveredOrders
      .filter((o) => o.feedback && o.feedback.rating)
      .map((o) => o.feedback.rating);

    const avgRating = ratingsArr.length > 0
      ? (ratingsArr.reduce((a, b) => a + b, 0) / ratingsArr.length).toFixed(1)
      : 0;

    // This month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthDelivered = deliveredOrders.filter(
      (o) => new Date(o.date) >= monthStart
    ).length;

    res.status(200).json({
      success: true,
      data: {
        today: {
          total: todayOrders.length,
          delivered: todayOrders.filter((o) => o.status === 'delivered').length,
          pending: todayOrders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length,
        },
        allTime: {
          totalDeliveries: deliveredOrders.length,
          averageRating: Number(avgRating),
          totalRatings: ratingsArr.length,
        },
        thisMonth: {
          deliveries: thisMonthDelivered,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
