import { Router } from 'express';
import {
  getDashboardStats,
  getOrderForecast,
  getAllCustomers,
  getCustomerById,
  issueRefund,
  getAllFeedback,
  assignDeliveryPartner,
} from '../controllers/admin.controller.js';
import auth from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';

const router = Router();

// All admin routes require auth + admin role
router.use(auth, roleGuard('admin'));

router.get('/stats', getDashboardStats);
router.get('/forecast', getOrderForecast);
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerById);
router.post('/refund', issueRefund);
router.get('/feedback', getAllFeedback);
router.post('/assign-delivery', assignDeliveryPartner);

export default router;
