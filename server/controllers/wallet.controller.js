import { createOrder, verifyPayment } from '../services/razorpay.service.js';
import Wallet from '../models/Wallet.js';
import { createPaymentOrder } from '../services/payment.service.js';

/**
 * @desc    Get user's wallet with balance and recent transactions
 * @route   GET /api/wallet
 * @access  Private
 */
export const getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
        transactions: [],
      });
    }

    // Return only last 10 transactions by default
    const recentTransactions = wallet.transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        balanceInRupees: (wallet.balance / 100).toFixed(2),
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add funds to wallet (mock payment)
 * @route   POST /api/wallet/add-funds
 * @access  Private
 */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum amount is ₹1' });
    }
    const order = await createOrder(amount / 100);
    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    // Map 401 error code from Razorpay to a 400 Bad Request to prevent logging out the user
    const statusCode = err.statusCode === 401 ? 400 : (err.statusCode || 500);
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Razorpay order creation failed.'
    });
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
    const wallet = await Wallet.findOne({ user: req.user._id });
    await wallet.credit(amount, 'Funds added to wallet', razorpay_payment_id);
    res.json({ success: true, message: 'Payment successful', balance: wallet.balance });
  } catch (err) {
    console.error('Razorpay payment verification error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Razorpay payment verification failed.'
    });
  }
};

export const addFunds = async (req, res, next) => {
  try {
    const { amount } = req.body; // amount in paise

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number (in paise).',
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum add amount is ₹1 (100 paise).',
      });
    }

    // Create mock payment order
    const paymentOrder = await createPaymentOrder(amount);

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
        transactions: [],
      });
    }

    await wallet.credit(
      amount,
      'Funds added to wallet',
      paymentOrder.id
    );

    res.status(200).json({
      success: true,
      message: `₹${(amount / 100).toFixed(2)} added to wallet.`,
      data: {
        balance: wallet.balance,
        balanceInRupees: (wallet.balance / 100).toFixed(2),
        paymentOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated transaction history
 * @route   GET /api/wallet/transactions?page=1&limit=20
 * @access  Private
 */
export const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        page,
        pages: 0,
        data: [],
      });
    }

    // Sort transactions by date descending
    const sortedTransactions = wallet.transactions.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    const total = sortedTransactions.length;
    const start = (page - 1) * limit;
    const paginatedTransactions = sortedTransactions.slice(start, start + limit);

    res.status(200).json({
      success: true,
      count: paginatedTransactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: paginatedTransactions,
    });
  } catch (error) {
    next(error);
  }
};
