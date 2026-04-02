import { Router } from 'express';
import { getAllUsers, updateUserRole, deleteUser, getDashboardStats } from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
