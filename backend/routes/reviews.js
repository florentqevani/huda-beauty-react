import { Router } from 'express';
import { getProductReviews, createReview, deleteReview } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', authenticateToken, createReview);
router.delete('/:productId/reviews/:reviewId', authenticateToken, deleteReview);

export default router;
