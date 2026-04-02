import pool from '../config/db.js';

export async function getCart(req, res) {
    try {
        const result = await pool.query(
            `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 ORDER BY ci.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function addToCart(req, res) {
    try {
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const product = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const result = await pool.query(
            `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + $3
       RETURNING *`,
            [req.user.id, productId, quantity || 1]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateCartItem(req, res) {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1' });
        }

        const result = await pool.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [quantity, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function removeFromCart(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function clearCart(req, res) {
    try {
        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
