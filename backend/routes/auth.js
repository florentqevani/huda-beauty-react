import { Router } from 'express';
import { register, login, refreshAccessToken, logout, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);

export default router;
