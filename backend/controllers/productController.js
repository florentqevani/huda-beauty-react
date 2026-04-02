import pool from '../config/db.js';

export async function getAllProducts(req, res) {
    try {
        const { category } = req.query;
        let result;
        if (category?.trim()) {
            result = await pool.query(
                'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC',
                [category.trim()]
            );
        } else {
            result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getProduct(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getBestSellers(req, res) {
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE is_bestseller = true ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get best sellers error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function createProduct(req, res) {
    try {
        const { name, description, price, rating, category, is_bestseller } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        const image = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await pool.query(
            `INSERT INTO products (name, description, price, image, rating, category, is_bestseller)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, description || null, price, image, rating || 4.5, category || 'general', is_bestseller || false]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { name, description, price, rating, category, is_bestseller } = req.body;

        const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const image = req.file ? `/uploads/${req.file.filename}` : existing.rows[0].image;

        const result = await pool.query(
            `UPDATE products SET name = $1, description = $2, price = $3, image = $4, rating = $5,
       category = $6, is_bestseller = $7 WHERE id = $8 RETURNING *`,
            [
                name || existing.rows[0].name,
                description !== undefined ? description : existing.rows[0].description,
                price || existing.rows[0].price,
                image,
                rating || existing.rows[0].rating,
                category || existing.rows[0].category,
                is_bestseller !== undefined ? is_bestseller : existing.rows[0].is_bestseller,
                id,
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
