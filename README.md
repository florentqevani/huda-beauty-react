# Huda Beauty – React E-Commerce App

A full-stack beauty e-commerce application built with React, Express.js, and PostgreSQL. Browse products, filter by category, manage your cart, and check out — all in one place.

---

## Quick Start (Docker)

The fastest way to run everything (frontend + backend + database):

```bash
docker compose up --build
```

The app will be available at **http://localhost:5000**.

### Seed the Database

On first run, populate the database with sample products and an admin account:

```bash
docker compose --profile seed run --rm seed
```

This creates the tables, loads sample products (face, lips, eyes, fragrance), and creates a default admin user.

### Default Admin Account

| Email                  | Password  |
|------------------------|-----------|
| admin@hudabeauty.com   | admin123  |

> Change credentials before deploying to production.

---

## Local Development (without Docker)

### Prerequisites

- Node.js 18+
- PostgreSQL 16

### 1. Set Up the Database

Create a PostgreSQL database and run the init script:

```bash
psql -U postgres -c "CREATE DATABASE huda_beauty;"
psql -U postgres -d huda_beauty -f db/init.sql
```

### 2. Start the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=huda_beauty
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
```

```bash
npm run seed   # populate sample data
npm run dev    # start with auto-reload
```

The API runs on **http://localhost:5000/api**.

### 3. Start the Frontend

```bash
npm install
npm run dev
```

The dev server runs on **http://localhost:5173** and proxies API requests to the backend.

---

## Using the App

### Browsing Products

- The **Home** page displays all products, best sellers, and featured items.
- Use the **filter tabs** (All · Face · Lips · Eyes · Fragrance) in the All Products section to narrow by category.
- Each product card shows the image, name, star rating, and price.

### Account

- Click the **user icon** in the header to register or log in.
- Logging out redirects you to the home page.

### Shopping Cart

- Click **Add to cart** on any product card (login required).
- The cart icon in the header shows your item count.
- On the **Cart** page, adjust quantities or remove items.
- Orders of **$100+** qualify for free shipping.

### Checkout

- From the cart, proceed to **Checkout**.
- Enter your shipping address (name, address, city, zip code).
- Choose a payment method: **Card**, **PayPal**, or **Apple Pay**.
- Confirm the order to see a success summary.

### Order History

- Click the **orders icon** (box) in the header to view past orders.
- Each order shows its status: Processing → Shipped → Delivered.

### Admin Dashboard

Accessible only to admin accounts via the **dashboard icon** in the header.

- **Overview**: total users, products, and orders at a glance.
- **Products**: create, edit, and delete products. Upload product images. Toggle bestseller status.
- **Users**: view all registered users. Change roles (user/admin). Delete accounts.
- **Orders**: view all orders across users. Update order status.

---

## Project Structure

```
├── backend/            Express.js API
│   ├── controllers/    Route handlers (auth, products, cart, orders, admin)
│   ├── routes/         Route definitions
│   ├── middleware/      JWT auth middleware
│   ├── data/           Database connection
│   └── seed.js         Database seeder
├── db/
│   └── init.sql        PostgreSQL schema
├── public/             Static assets & product photos
├── src/                React frontend
│   ├── api/            API client with auto token refresh
│   ├── components/     Reusable UI components
│   ├── context/        Auth & Cart context providers
│   ├── data/           Static fallback product data
│   └── pages/          Route pages (Home, Cart, Checkout, Orders, Admin)
├── docker-compose.yml  Full-stack Docker setup
├── Dockerfile          Multi-stage build (Vite → Node)
└── vite.config.js      Dev server + API proxy config
```

---

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React 19, React Router 7, Vite 8  |
| Backend   | Express.js 4, Node.js             |
| Database  | PostgreSQL 16                      |
| Auth      | JWT (access + refresh tokens), bcrypt |
| Uploads   | Multer                             |
| Container | Docker, Docker Compose             |
