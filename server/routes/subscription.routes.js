import { Router } from 'express';
import {
  createSubscription,
  getMySubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from '../controllers/subscription.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

// All subscription routes require authentication
router.use(auth);

router.post('/', createSubscription);
router.get('/', getMySubscriptions);
router.patch('/:id/pause', pauseSubscription);
router.patch('/:id/resume', resumeSubscription);
router.patch('/:id/cancel', cancelSubscription);

export default router;
