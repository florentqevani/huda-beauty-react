import bcrypt from 'bcrypt';
import pool from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
    try {
        // Run init.sql
        const initSql = fs.readFileSync(path.join(__dirname, '..', 'db', 'init.sql'), 'utf8');
        await pool.query(initSql);
        console.log('Tables created');

        // Create admin user with hashed password
        const adminPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $3`,
            ['Admin', 'admin@hudabeauty.com', adminPassword, 'admin']
        );
        console.log('Admin user created (admin@hudabeauty.com / admin123)');

        // Seed products
        const products = [
            { name: 'Easy Bake Setting Spray with 16-Hour Wear', price: 35.00, image: '/Product-Photos/EASYBAKE-SETTING SPRAY-PDP_PACKSHOT.jpg', rating: 4.5, category: 'face' },
            { name: 'Blush Filter Liquid Blush New Shades', price: 29.00, image: '/Product-Photos/ALL-BLUSH-PDP-PACKSHOTS_BUBBLEGUM.jpg', rating: 4.5, category: 'face' },
            { name: 'Smoky Oud', price: 225.00, image: '/Product-Photos/SMOKY-OUD.jpg', rating: 4.5, category: 'fragrance' },
            { name: 'Lovefest Burning Cherry | 48 All Over Body Spray', price: 48.00, image: '/Product-Photos/KY-BodySprays-0808.jpg', rating: 4.5, category: 'fragrance' },
            { name: 'Vanilla | 28', price: 139.00, image: '/Product-Photos/KAY_100ml_Vanilla_Bottle.jpg', rating: 4.5, category: 'fragrance' },
            { name: 'Easy Prime & Blur Foundation Kit', price: 69.00, image: '/Product-Photos/PRIMEBLURNoDiscount-u.jpg', rating: 4.5, category: 'face' },
            { name: 'Liquid Matte Ultra-Comfort Transfer-Proof Lipstick', price: 29.00, image: '/Product-Photos/LIQUID-MATTE-PACKSHOT-MISS-AMERICA.jpg', rating: 4.5, category: 'lips' },
            { name: 'Easy Bake Loose Baking & Setting Powder', price: 46.00, image: '/Product-Photos/HB-EasyBake-6BananaBread-Packshots-2.jpg', rating: 4.5, category: 'face' },
            { name: '#FAUXFILTER Under Eye Color Corrector', price: 33.00, image: '/Product-Photos/HB_FFCC-REFRESH_PACKSHOT_MANGO.jpg', rating: 4.5, category: 'face' },
            { name: 'Easy Bake and Snatch Pressed Talc-Free Brightening and Setting Powder', price: 41.00, image: '/Product-Photos/EASY BAKE PRESSED-PDP-PACKSHOTS_BANANA-BREAD.jpg', rating: 4.5, category: 'face' },
            { name: 'Cheeky Tint Blush Stick Brush', price: 29.00, image: '/Product-Photos/CheekyTintBSB4.jpg', rating: 4.5, category: 'face' },
            { name: 'GloWish Blur Jam Silicone-Free Smoothing Primer', price: 38.00, image: '/Product-Photos/Glowish-Blur-Jam-1.jpg', rating: 4.5, category: 'face' },
            { name: 'Pretty Grunge Liquid Matte Lip Quad', price: 33.00, image: '/Product-Photos/HB-PrettyGrunge-LM-Quad.jpg', rating: 4.5, category: 'lips', is_bestseller: true },
            { name: 'Liquid Matte and Silk Balm Duo', price: 29.00, image: '/Product-Photos/HB-PrettyGrunge-GrungeLipDuo.jpg', rating: 4.5, category: 'lips', is_bestseller: true },
            { name: 'Pretty Grunge Palette', price: 69.00, image: '/Product-Photos/PRETTY-GRUNGEPACKSHOT-pallet-2023.jpg', rating: 4.5, category: 'eyes', is_bestseller: true },
            { name: 'Pretty Grunge Face Gloss', price: 44.00, image: '/Product-Photos/PRETTY-GRUNGE_PACKSHOT.jpg', rating: 4.5, category: 'face', is_bestseller: true },
        ];

        for (const p of products) {
            await pool.query(
                `INSERT INTO products (name, price, image, rating, category, is_bestseller)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
                [p.name, p.price, p.image, p.rating, p.category, p.is_bestseller || false]
            );
        }
        console.log('Products seeded');

        console.log('Seed complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
