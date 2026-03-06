# BlinkMart – Full-Stack Quick Commerce Clone

A Blinkit-inspired 15-minute grocery delivery app built with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Query
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt

---

## Features

### Customer
- Browse products by category
- Live search with debounce
- Add to cart / update quantities
- Checkout with address management
- Apply coupon codes (WELCOME50, FLAT30)
- Order tracking with status timeline
- Cancel orders
- Profile & password management

### Admin Panel (`/admin`)
- Dashboard with stats & revenue
- Product CRUD (with images, stock, pricing)
- Category management
- Order management with status updates
- User list

---

## Quick Start

### 1. Start the database

```bash
docker-compose up -d
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Demo Credentials

| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| Admin | admin@blinkmart.com     | admin123  |
| User  | user@blinkmart.com      | user123   |

---

## API Endpoints

| Method | Path                         | Description            | Auth     |
|--------|------------------------------|------------------------|----------|
| POST   | /api/auth/register           | Register user          | —        |
| POST   | /api/auth/login              | Login                  | —        |
| GET    | /api/auth/me                 | Get current user       | User     |
| GET    | /api/products                | List products          | —        |
| GET    | /api/products/search?q=      | Search products        | —        |
| GET    | /api/categories              | List categories        | —        |
| GET    | /api/cart                    | Get cart               | User     |
| POST   | /api/cart/items              | Add to cart            | User     |
| POST   | /api/orders                  | Place order            | User     |
| GET    | /api/orders/my               | My orders              | User     |
| GET    | /api/admin/stats             | Dashboard stats        | Admin    |
| PUT    | /api/orders/:id/status       | Update order status    | Admin    |

---

## Coupon Codes

| Code       | Discount           | Min Order |
|------------|--------------------|-----------|
| WELCOME50  | 50% off (max ₹100) | ₹99       |
| FLAT30     | Flat ₹30 off       | ₹199      |

---

## Project Structure

```
blinkit-clone/
├── backend/
│   ├── prisma/schema.prisma    # Database schema
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   ├── routes/             # Express routes
│   │   ├── middleware/         # Auth, error handling
│   │   ├── utils/              # JWT, responses
│   │   └── seed.ts             # Sample data
│   └── .env.example
├── frontend/
│   └── src/
│       ├── pages/              # Route components
│       ├── components/         # Reusable UI
│       ├── store/              # Zustand stores
│       ├── api/                # Axios API layer
│       └── types/              # TypeScript types
└── docker-compose.yml
```
