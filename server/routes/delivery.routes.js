import { Router } from 'express';
import {
  getMyDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  submitDeliveryProof,
  getDeliveryStats,
} from '../controllers/delivery.controller.js';
import auth from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';
import { uploadSingle } from '../middleware/upload.js';

const router = Router();

// All delivery routes require auth + delivery role
router.use(auth, roleGuard('delivery', 'admin'));

router.get('/', getMyDeliveries);
router.get('/stats', getDeliveryStats);
router.get('/:id', getDeliveryById);
router.patch('/:id/status', updateDeliveryStatus);
router.post('/:id/proof', uploadSingle, submitDeliveryProof);

export default router;
