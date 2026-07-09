import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import env from '../config/env.js';
const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });
};

/**
 * @desc    Direct Login / Register using phone number
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginDirect = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid phone number is required (min 10 digits).',
      });
    }

    // Find or create user
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      user = await User.create({ phone });
      isNewUser = true;

      // Create wallet for new user
      await Wallet.create({ user: user._id, balance: 0, transactions: [] });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user,
      isNewUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register / complete user profile (name, dietary prefs, address)
 * @route   PUT /api/auth/register
 * @access  Private
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, dietaryPreferences, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (dietaryPreferences) updateData.dietaryPreferences = dietaryPreferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...updateData,
        ...(address && { $push: { addresses: address } }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'avatar', 'dietaryPreferences', 'addresses'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
