import pool from '../config/db.js';

export async function getAllUsers(req, res) {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
            [role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update user role error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getDashboardStats(req, res) {
    try {
        const [usersCount, productsCount, ordersResult, revenueResult] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM users'),
            pool.query('SELECT COUNT(*) FROM products'),
            pool.query('SELECT COUNT(*) FROM orders'),
            pool.query('SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE payment_status = $1', ['completed']),
        ]);

        res.json({
            totalUsers: parseInt(usersCount.rows[0].count),
            totalProducts: parseInt(productsCount.rows[0].count),
            totalOrders: parseInt(ordersResult.rows[0].count),
            totalRevenue: parseFloat(revenueResult.rows[0].revenue),
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
