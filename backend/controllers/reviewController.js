import pool from '../config/db.js';

export async function getProductReviews(req, res) {
    try {
        const { productId } = req.params;
        const result = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, r.user_id,
                    u.name AS user_name
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             WHERE r.product_id = $1
             ORDER BY r.created_at DESC`,
            [productId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function createReview(req, res) {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const product = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const result = await pool.query(
            `INSERT INTO reviews (product_id, user_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (product_id, user_id)
             DO UPDATE SET rating = $3, comment = $4, created_at = NOW()
             RETURNING *`,
            [productId, userId, rating, comment || null]
        );

        // Update product average rating
        const avgResult = await pool.query(
            'SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating FROM reviews WHERE product_id = $1',
            [productId]
        );
        if (avgResult.rows[0].avg_rating) {
            await pool.query('UPDATE products SET rating = $1 WHERE id = $2', [
                avgResult.rows[0].avg_rating,
                productId,
            ]);
        }

        const review = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, r.user_id,
                    u.name AS user_name
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             WHERE r.id = $1`,
            [result.rows[0].id]
        );

        res.status(201).json(review.rows[0]);
    } catch (err) {
        console.error('Create review error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteReview(req, res) {
    try {
        const { productId, reviewId } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        const conditions = isAdmin
            ? 'id = $1 AND product_id = $2'
            : 'id = $1 AND product_id = $2 AND user_id = $3';
        const params = isAdmin ? [reviewId, productId] : [reviewId, productId, userId];

        const result = await pool.query(
            `DELETE FROM reviews WHERE ${conditions} RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Update product average rating
        const avgResult = await pool.query(
            'SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating FROM reviews WHERE product_id = $1',
            [productId]
        );
        await pool.query('UPDATE products SET rating = $1 WHERE id = $2', [
            avgResult.rows[0].avg_rating || 0,
            productId,
        ]);

        res.json({ message: 'Review deleted' });
    } catch (err) {
        console.error('Delete review error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
