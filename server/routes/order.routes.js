import { Router } from 'express';
import {
  getMyOrders,
  getOrderById,
  getTodaysOrder,
  updateOrderStatus,
  submitFeedback,
} from '../controllers/order.controller.js';
import auth from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';

const router = Router();

// All order routes require authentication
router.use(auth);

router.get('/', getMyOrders);
router.get('/today', getTodaysOrder);
router.get('/:id', getOrderById);
router.patch('/:id/status', roleGuard('admin', 'delivery'), updateOrderStatus);
router.post('/:id/feedback', submitFeedback);

export default router;
