import { Router } from 'express';
import {
  loginDirect,
  register,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', loginDirect);

// Protected routes
router.put('/register', auth, register);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

export default router;
