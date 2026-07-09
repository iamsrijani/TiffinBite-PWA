import Subscription from '../models/Subscription.js';
import Wallet from '../models/Wallet.js';

/**
 * Plan configuration: duration in days and meal multipliers.
 */
const PLAN_CONFIG = {
  trial: { days: 3, label: 'Trial (3 days)' },
  weekly: { days: 7, label: 'Weekly (7 days)' },
  monthly: { days: 30, label: 'Monthly (30 days)' },
};

/**
 * Calculate total meals based on plan and meal type.
 * @param {string} plan - trial/weekly/monthly
 * @param {string} mealType - lunch/dinner/both
 * @returns {number} Total meals
 */
const calculateTotalMeals = (plan, mealType) => {
  const days = PLAN_CONFIG[plan]?.days || 7;
  const mealsPerDay = mealType === 'both' ? 2 : 1;
  return days * mealsPerDay;
};

/**
 * @desc    Create a subscription
 * @route   POST /api/subscriptions
 * @access  Private
 */
export const createSubscription = async (req, res, next) => {
  try {
    const { plan, mealType, dietType, deliveryAddress, addressId, paymentMethod } = req.body;

let resolvedAddress = deliveryAddress;
const targetAddressId =
  addressId || (typeof deliveryAddress === 'string' ? deliveryAddress : null);

if (targetAddressId && req.user && req.user.addresses) {
  resolvedAddress = req.user.addresses.find(
    (addr) => addr._id.toString() === targetAddressId.toString()
  );
}

    if (!plan || !mealType || !dietType || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Plan, mealType, dietType, and deliveryAddress are required.',
      });
    }

    if (!PLAN_CONFIG[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Choose from: trial, weekly, monthly.',
      });
    }

    // Check for existing active subscription
    const existingActive = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription. Cancel or wait for it to expire.',
      });
    }

    // Calculate dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start from tomorrow
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + PLAN_CONFIG[plan].days - 1);
    endDate.setHours(23, 59, 59, 999);

    const totalMeals = calculateTotalMeals(plan, mealType);

    // Calculate price (use a base price if no menu is available yet)
    // Base price: ₹150 per meal (15000 paise)
    const pricePerMeal = 15000; // paise
    const totalAmount = totalMeals * pricePerMeal;

    // Handle payment
    let paymentId = '';
    if (paymentMethod === 'wallet' || !paymentMethod) {
      const wallet = await Wallet.findOne({ user: req.user._id });
      if (!wallet || wallet.balance < totalAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. Required: ₹${(totalAmount / 100).toFixed(2)}, Available: ₹${wallet ? (wallet.balance / 100).toFixed(2) : '0.00'}`,
        });
      }
      await wallet.debit(totalAmount, `Subscription: ${PLAN_CONFIG[plan].label}`, '');
      paymentId = `wallet_${Date.now()}`;
    } else {
      // Mock payment — in production, integrate with Razorpay
      paymentId = `mock_${Date.now()}`;
    }

    const subscription = await Subscription.create({
      user: req.user._id,
      plan,
      mealType,
      dietType,
      deliveryAddress: resolvedAddress,
      startDate,
      endDate,
      totalMeals,
      mealsRemaining: totalMeals,
      amountPaid: totalAmount,
      paymentId,
    });

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's subscriptions
 * @route   GET /api/subscriptions
 * @access  Private
 */
export const getMySubscriptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const subscriptions = await Subscription.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Pause subscription for specific dates
 * @route   PATCH /api/subscriptions/:id/pause
 * @access  Private
 */
export const pauseSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dates } = req.body; // Array of date strings to pause

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide an array of dates to pause.',
      });
    }

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found.',
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active subscriptions can be paused.',
      });
    }

    // Validate cutoff: must be before 8 PM the night before the pause date
    const now = new Date();
    const invalidDates = [];
    const validDates = [];

    for (const dateStr of dates) {
      const pauseDate = new Date(dateStr);
      pauseDate.setHours(0, 0, 0, 0);

      // Cutoff is 8 PM the day before
      const cutoff = new Date(pauseDate);
      cutoff.setDate(cutoff.getDate() - 1);
      const [cutoffHour, cutoffMin] = subscription.pauseCutoffTime.split(':').map(Number);
      cutoff.setHours(cutoffHour, cutoffMin, 0, 0);

      if (now > cutoff) {
        invalidDates.push(dateStr);
      } else if (pauseDate >= subscription.startDate && pauseDate <= subscription.endDate) {
        validDates.push(pauseDate);
      }
    }

    if (invalidDates.length > 0 && validDates.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot pause for these dates (past cutoff time ${subscription.pauseCutoffTime} the night before): ${invalidDates.join(', ')}`,
      });
    }

    // Add valid dates to pausedDates (avoid duplicates)
    const existingPaused = subscription.pausedDates.map((d) => d.getTime());
    const newPaused = validDates.filter((d) => !existingPaused.includes(d.getTime()));

    subscription.pausedDates.push(...newPaused);
    await subscription.save();

    res.status(200).json({
      success: true,
      message: `Paused ${newPaused.length} date(s).${invalidDates.length > 0 ? ` ${invalidDates.length} date(s) skipped (past cutoff).` : ''}`,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resume subscription (remove future paused dates)
 * @route   PATCH /api/subscriptions/:id/resume
 * @access  Private
 */
export const resumeSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found.',
      });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Remove only future paused dates
    const removedCount = subscription.pausedDates.filter(
      (d) => new Date(d).getTime() >= now.getTime()
    ).length;

    subscription.pausedDates = subscription.pausedDates.filter(
      (d) => new Date(d).getTime() < now.getTime()
    );

    if (subscription.status === 'paused') {
      subscription.status = 'active';
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      message: `Resumed subscription. Removed ${removedCount} future paused date(s).`,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel subscription and refund remaining meals to wallet
 * @route   PATCH /api/subscriptions/:id/cancel
 * @access  Private
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found.',
      });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled.',
      });
    }

    if (subscription.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an expired subscription.',
      });
    }

    // Calculate refund for remaining meals
    const pricePerMeal = subscription.totalMeals > 0
      ? Math.floor(subscription.amountPaid / subscription.totalMeals)
      : 0;
    const refundMeals = subscription.mealsRemaining || (subscription.totalMeals - subscription.mealsDelivered);
    const refundAmount = pricePerMeal * refundMeals;

    subscription.status = 'cancelled';
    await subscription.save();

    // Credit refund to wallet
    if (refundAmount > 0) {
      let wallet = await Wallet.findOne({ user: req.user._id });
      if (!wallet) {
        wallet = await Wallet.create({ user: req.user._id, balance: 0, transactions: [] });
      }
      await wallet.credit(
        refundAmount,
        `Refund: Subscription cancelled (${refundMeals} meals)`,
        subscription._id.toString()
      );
    }

    res.status(200).json({
      success: true,
      message: `Subscription cancelled. ₹${(refundAmount / 100).toFixed(2)} refunded to wallet for ${refundMeals} remaining meal(s).`,
      data: {
        subscription,
        refund: {
          meals: refundMeals,
          amount: refundAmount,
          amountInRupees: (refundAmount / 100).toFixed(2),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
