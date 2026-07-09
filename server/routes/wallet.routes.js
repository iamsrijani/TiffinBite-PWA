import { Router } from 'express';
import {
  getWallet,
  addFunds,
  getTransactions,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/wallet.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

// All wallet routes require authentication
router.use(auth);

router.get('/', getWallet);
router.post('/add-funds', addFunds);
router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyRazorpayPayment);
router.get('/transactions', getTransactions);

export default router;
