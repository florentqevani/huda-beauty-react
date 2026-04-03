import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from '../backend/routes/auth.js';
import productRoutes from '../backend/routes/products.js';
import cartRoutes from '../backend/routes/cart.js';
import orderRoutes from '../backend/routes/orders.js';
import adminRoutes from '../backend/routes/admin.js';
import reviewRoutes from '../backend/routes/reviews.js';

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', reviewRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

export default app;
