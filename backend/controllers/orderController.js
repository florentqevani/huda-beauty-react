import pool from '../config/db.js';

export async function createOrder(req, res) {
    const client = await pool.connect();
    try {
        const { paymentMethod, shippingName, shippingAddress, shippingCity, shippingZip } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ error: 'Payment method is required' });
        }

        if (!['card', 'paypal', 'apple_pay'].includes(paymentMethod)) {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        if (!shippingName || !shippingAddress || !shippingCity || !shippingZip) {
            return res.status(400).json({ error: 'Shipping details are required' });
        }

        await client.query('BEGIN');

        const cartResult = await client.query(
            `SELECT ci.id, ci.quantity, p.id as product_id, p.price
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
            [req.user.id]
        );

        if (cartResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const total = cartResult.rows.reduce(
            (sum, item) => sum + parseFloat(item.price) * item.quantity,
            0
        );

        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total, payment_method, payment_status, shipping_name, shipping_address, shipping_city, shipping_zip)
       VALUES ($1, $2, $3, 'completed', $4, $5, $6, $7) RETURNING *`,
            [req.user.id, total, paymentMethod, shippingName, shippingAddress, shippingCity, shippingZip]
        );

        const order = orderResult.rows[0];

        for (const item of cartResult.rows) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [order.id, item.product_id, item.quantity, item.price]
            );
        }

        await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

        await client.query('COMMIT');

        res.status(201).json(order);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
}

export async function getUserOrders(req, res) {
    try {
        const orders = await pool.query(
            `SELECT o.*, json_agg(json_build_object(
        'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity,
        'price', oi.price, 'name', p.name, 'image', p.image
      )) as items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json(orders.rows);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getAllOrders(req, res) {
    try {
        const orders = await pool.query(
            `SELECT o.*, u.name as user_name, u.email as user_email,
       json_agg(json_build_object(
        'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity,
        'price', oi.price, 'name', p.name, 'image', p.image
      )) as items
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC`
        );
        res.json(orders.rows);
    } catch (err) {
        console.error('Get all orders error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update order error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
