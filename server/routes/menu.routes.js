import { Router } from 'express';
import {
  getMenuByDate,
  getWeeklyMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  publishMenu,
} from '../controllers/menu.controller.js';
import auth from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';

const router = Router();

// Public routes
router.get('/', getMenuByDate);
router.get('/weekly', getWeeklyMenu);

// Admin-only routes
router.post('/', auth, roleGuard('admin'), createMenu);
router.put('/:id', auth, roleGuard('admin'), updateMenu);
router.delete('/:id', auth, roleGuard('admin'), deleteMenu);
router.patch('/:id/publish', auth, roleGuard('admin'), publishMenu);

export default router;
