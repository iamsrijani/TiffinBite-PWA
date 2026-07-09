import env from '../config/env.js';
import crypto from 'crypto';

/**
 * Mock payment service.
 * In production, this would integrate with Razorpay or a similar gateway.
 */

/**
 * Create a mock payment order.
 * @param {number} amount - Amount in paise
 * @param {string} currency - Currency code (default: INR)
 * @returns {Object} Mock payment order
 */
export const createPaymentOrder = async (amount, currency = 'INR') => {
  const orderId = `order_${crypto.randomBytes(12).toString('hex')}`;

  console.log(`💳 Payment order created: ${orderId}, Amount: ₹${(amount / 100).toFixed(2)} ${currency}`);

  return {
    id: orderId,
    amount,
    currency,
    status: 'created',
    createdAt: new Date().toISOString(),
    // In production, this would include Razorpay order details
    ...(env.isProd && {
      razorpayKeyId: env.RAZORPAY_KEY_ID,
    }),
  };
};

/**
 * Verify a mock payment.
 * @param {string} paymentId - Payment ID
 * @param {string} orderId - Order ID
 * @param {string} signature - Payment signature
 * @returns {Object} Verification result
 */
export const verifyPayment = async (paymentId, orderId, signature) => {
  console.log(`💳 Payment verification: paymentId=${paymentId}, orderId=${orderId}`);

  if (env.isProd && env.RAZORPAY_KEY_SECRET) {
    // In production, verify HMAC signature
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === signature;
    return {
      verified: isValid,
      paymentId,
      orderId,
    };
  }

  // Mock verification always succeeds in dev
  return {
    verified: true,
    paymentId: paymentId || `pay_${crypto.randomBytes(12).toString('hex')}`,
    orderId,
  };
};

/**
 * Process a mock refund.
 * @param {string} paymentId - Original payment ID
 * @param {number} amount - Refund amount in paise
 * @returns {Object} Refund result
 */
export const processRefund = async (paymentId, amount) => {
  const refundId = `rfnd_${crypto.randomBytes(12).toString('hex')}`;

  console.log(`💳 Refund processed: ${refundId}, Amount: ₹${(amount / 100).toFixed(2)}, Original Payment: ${paymentId}`);

  return {
    id: refundId,
    paymentId,
    amount,
    status: 'processed',
    createdAt: new Date().toISOString(),
  };
};
