CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2) NOT NULL,
    image       VARCHAR(500),
    rating      DECIMAL(3, 1) DEFAULT 4.5,
    category    VARCHAR(100) DEFAULT 'general',
    is_bestseller BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total          DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('card', 'paypal', 'apple_pay')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    status         VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled')),
    shipping_name    VARCHAR(200),
    shipping_address TEXT,
    shipping_city    VARCHAR(100),
    shipping_zip     VARCHAR(20),
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    price      DECIMAL(10, 2) NOT NULL
);

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@hudabeauty.com', '$2b$10$placeholder', 'admin')
ON CONFLICT (email) DO NOTHING;
