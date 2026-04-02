import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` }
    );
}

export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, passwordHash, 'user']
        );

        const user = result.rows[0];
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, refreshToken, expiresAt]
        );

        res.status(201).json({ user, accessToken, refreshToken });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
        const accessToken = generateAccessToken(userData);
        const refreshToken = generateRefreshToken(userData);

        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, refreshToken, expiresAt]
        );

        res.json({ user: userData, accessToken, refreshToken });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function refreshAccessToken(req, res) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const tokenResult = await pool.query(
            'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
            [refreshToken]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }

        let payload;
        try {
            payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        } catch {
            await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const userResult = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = $1',
            [payload.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(403).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        const newAccessToken = generateAccessToken(user);

        res.json({ accessToken: newAccessToken, user });
    } catch (err) {
        console.error('Refresh token error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function logout(req, res) {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        }

        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getMe(req, res) {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
