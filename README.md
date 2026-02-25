# 🧁 Sweet Haven — Full-Stack Bakery E-Commerce

A production-ready bakery e-commerce website built with **React + Vite** (frontend) and **Node.js + Express** (backend), using **Supabase** as the database and **Razorpay** for payments.

---

## 🗂️ Project Structure

```
sweets/
├── backend/               # Node.js + Express API
│   ├── config/            # Supabase client config
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth, validation middleware
│   ├── routes/            # API route definitions
│   ├── supabase-schema.sql # Database schema (run in Supabase SQL Editor)
│   ├── .env.example       # ← Copy this to .env and fill in values
│   └── server.js          # App entry point
│
└── frontend/              # React + Vite app
    └── src/
        ├── components/    # Navbar, Footer, ProductCard, AdminSidebar…
        ├── context/       # AuthContext, CartContext
        ├── pages/         # Home, Products, Cart, Checkout, Login…
        │   └── admin/     # AdminDashboard, AdminProducts, AdminOrders, AdminReports
        └── services/      # Axios API instance
```

---

## ⚙️ Setup Instructions

### 1. Supabase Setup
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `backend/supabase-schema.sql`
3. Copy your credentials from **Settings → API**

### 2. Backend Setup

```bash
cd backend

# Create your .env file
cp .env.example .env
# Then edit .env with your real credentials (see below)

npm install
npm run dev     # Starts on http://localhost:6000
```

**Required `.env` values:**
```env
PORT=6000
NODE_ENV=development

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...   # service_role key (from Supabase Settings → API)
SUPABASE_ANON_KEY=eyJhbGc...      # anon key

JWT_SECRET=your_at_least_32_character_secret_here
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Starts on http://localhost:5173
```

The frontend proxies all `/api` calls to `http://localhost:6000` automatically.

### 4. Create Admin User
After running the schema and creating your first user via signup:
```sql
-- In Supabase SQL Editor:
UPDATE user_profiles SET role = 'admin' WHERE email = 'your@email.com';
```
Then log in at `/admin/login`.

---

## 🚀 Features

### Customer Facing
- 🏠 **Home** — Hero, category grid, featured products, testimonials
- 🛍️ **Products** — Search, category filter, pagination
- 🔍 **Product Detail** — Images, rating, stock indicator, reviews
- 🛒 **Cart** — Persistent (localStorage), quantity adjust, delivery estimate
- 💳 **Checkout** — Shipping form + Razorpay payment (UPI/Cards/NetBanking)
- 📦 **Order Success** — Status tracker, order summary
- 📋 **My Orders** — Full order history
- 👤 **Dashboard** — Stats, recent orders, quick links

### Admin Panel (`/admin/login`)
- 📊 **Dashboard** — Revenue/orders KPIs, revenue chart, top products, low stock alerts
- 🍫 **Products** — Full CRUD with modal, activate/deactivate, stock management
- 📦 **Orders** — Expandable table, status filter, inline status update
- 📈 **Reports** — Line chart, pie chart, horizontal bar chart, low stock table

---

## 🔒 Security
- JWT authentication with httpOnly cookies + localStorage fallback
- Role-based access control (customer / admin)
- Rate limiting on auth routes
- Helmet security headers
- Server-side price validation on checkout
- Razorpay signature verification

---

## 🎨 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Charts | Recharts |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Payments | Razorpay |
| Auth | JWT + bcrypt |
