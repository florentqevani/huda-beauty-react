import { Router } from 'express';
import { createOrder, getUserOrders, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/all', requireAdmin, getAllOrders);
router.put('/:id/status', requireAdmin, updateOrderStatus);

export default router;
