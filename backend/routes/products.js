import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import {
    getAllProducts,
    getProduct,
    getBestSellers,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = crypto.randomBytes(8).toString('hex') + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, AVIF, and GIF are allowed.'));
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.get('/', getAllProducts);
router.get('/bestsellers', getBestSellers);
router.get('/:id', getProduct);
router.post('/', authenticateToken, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;
