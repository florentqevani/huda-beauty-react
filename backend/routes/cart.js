import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export default router;
