import { Router } from 'express';
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from '../controllers/notification.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

// All notification routes require authentication
router.use(auth);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
