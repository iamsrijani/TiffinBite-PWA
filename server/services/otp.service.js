import env from '../config/env.js';

/**
 * In-memory OTP store.
 * Map<phone, { otp: string, expiresAt: number }>
 */
const otpStore = new Map();

/**
 * Generate a 6-digit random OTP.
 * In dev mode, always returns '123456'.
 * @returns {string} 6-digit OTP string
 */
export const generateOTP = () => {
  if (env.isDev) {
    return '123456';
  }
  return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Store an OTP for a phone number with auto-expiry.
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 */
export const storeOTP = (phone, otp) => {
  const expiresAt = Date.now() + env.OTP_EXPIRY * 60 * 1000;
  otpStore.set(phone, { otp, expiresAt });

  // Auto-cleanup after expiry
  setTimeout(() => {
    const stored = otpStore.get(phone);
    if (stored && stored.expiresAt <= Date.now()) {
      otpStore.delete(phone);
    }
  }, env.OTP_EXPIRY * 60 * 1000 + 1000);

  if (env.isDev) {
    console.log(`📱 OTP for ${phone}: ${otp} (expires in ${env.OTP_EXPIRY} min)`);
  }
};

/**
 * Verify an OTP for a phone number.
 * In dev mode, '123456' is always accepted.
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to verify
 * @returns {boolean} Whether the OTP is valid
 */
export const verifyOTP = (phone, otp) => {
  // Dev mode: always accept 123456
  if (env.isDev && otp === '123456') {
    otpStore.delete(phone);
    return true;
  }

  const stored = otpStore.get(phone);
  if (!stored) {
    return false;
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  if (stored.otp !== otp) {
    return false;
  }

  // OTP is valid — remove after use
  otpStore.delete(phone);
  return true;
};

/**
 * Get the count of stored OTPs (for monitoring).
 * @returns {number}
 */
export const getOTPCount = () => otpStore.size;
