# Onshipy

**Universal Reselling & Dropshipping Automation Platform**

Onshipy lets sellers import products from any website, set a markup price, and sell through their own connected store. When a customer buys, Onshipy automatically purchases from the source and ships directly to the customer — zero inventory, zero manual work.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [How It Works](#how-it-works)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Onshipy is a SaaS platform built for resellers and dropshippers. Instead of manually copying product details, placing orders, and tracking shipments, Onshipy automates the entire process:

1. Seller pastes any product URL from any website
2. Onshipy scrapes the product details, images, price and description
3. Seller sets their own selling price with a profit margin
4. Seller pushes the product to their Shopify, WooCommerce, or custom store
5. When a customer buys, Onshipy receives the order via webhook and auto-purchases from the source
6. The product ships directly to the customer

---

## Features

### Core
- **Universal product scraper** — import from Nike, ASOS, Zara, Amazon, and thousands of other websites using just a URL
- **Smart price engine** — set selling price manually or by profit margin percentage with live profit calculator
- **Product editor** — edit title, description, and images after importing
- **Listing management** — manage all priced products with profit and margin display

### Store Integration
- **Shopify push** — connect your Shopify store and push products with one click via the Shopify Admin API
- **WooCommerce** — coming soon
- **Webhook system** — connect any custom store using a webhook endpoint

### Automation
- **Auto-buy engine** — automatically purchases from source when a customer order is received
- **Order management** — full order tracking from placement to delivery
- **Tracking mirror** — shipment tracking synced back to your storefront

### Analytics & Management
- **Dashboard** — product count, import status, and quick import bar
- **Analytics** — revenue potential, profit potential, top listings, sources breakdown
- **Customer management** — grouped customer profiles with order history
- **Niche browser** — browse top brands by category (Fashion, Electronics, Beauty, Sports, Home, Auto) and import products in one click

### Account
- **Multi-plan billing** — Free, Pro ($29/mo), Enterprise ($99/mo)
- **Settings** — profile, store details, password, payment providers, notifications
- **Responsive design** — works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (Pages Router), React, inline styles |
| Backend | Node.js, Fastify |
| Database | PostgreSQL via Supabase |
| Scraper | axios + cheerio |
| Auth | JWT (via @fastify/jwt) |
| Payments | Stripe (planned) |
| Hosting | Render (frontend + backend) |
| Version control | GitHub |

---

## Project Structure

```
onshipy/
├── onshipy-frontend/
│   ├── components/
│   │   └── Layout.js              # Responsive sidebar layout
│   ├── pages/
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── dashboard.js
│   │   ├── products.js
│   │   ├── listings.js
│   │   ├── orders.js
│   │   ├── customers.js
│   │   ├── analytics.js
│   │   ├── browse.js              # Niche browser (/browse?niche=fashion)
│   │   ├── online-store.js        # Store connections + push
│   │   └── settings.js            # (/settings?section=general)
│   ├── styles/
│   │   └── globals.css
│   ├── .env.local
│   └── package.json
│
└── onshipy-backend/
    ├── src/
    │   ├── app.js                  # Fastify server entry point
    │   ├── routes/
    │   │   ├── auth.js             # Register, login
    │   │   ├── products.js         # Import, edit, delete, list
    │   │   ├── listings.js         # Get and delete listings
    │   │   ├── sellers.js          # Profile and password update
    │   │   ├── orders.js           # Customer orders
    │   │   ├── stores.js           # Shopify connect and push
    │   │   └── webhook.js          # Incoming order webhook
    │   ├── services/
    │   │   └── scraperService.js   # axios + cheerio scraper
    │   ├── workers/
    │   │   └── autoBuyWorker.js    # Auto-purchase engine (runs every 30s)
    │   └── db/
    │       ├── knex.js
    │       └── knexfile.js
    ├── .env
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A Supabase account and project
- A Render account (for deployment)
- Git

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/victorabuchi/onshipy.git
cd onshipy/onshipy-backend

# Install dependencies
npm install

# Create your .env file (see Environment Variables below)
cp .env.example .env

# Start development server
npm run dev
```

The backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd onshipy/onshipy-frontend

# Install dependencies
npm install

# Create your .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend runs on `http://localhost:3001`

### Environment Variables

#### Backend `.env`

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL=postgresql://user:password@host:port/database
STRIPE_SECRET_KEY=sk_test_your_stripe_key
ENCRYPTION_KEY=12345678901234567890123456789012
```

#### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Render Environment Variables (Production)

**Backend:**
```
JWT_SECRET=your_production_jwt_secret
DATABASE_URL=your_supabase_connection_string
NODE_ENV=production
ENCRYPTION_KEY=your_32_char_encryption_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
```

**Frontend:**
```
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
```

---

## Database Schema

Run these SQL statements in your Supabase SQL editor to create all required tables:

```sql
-- Sellers (users)
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  store_name VARCHAR,
  store_url VARCHAR,
  plan VARCHAR DEFAULT 'free',
  webhook_secret VARCHAR DEFAULT gen_random_uuid()::text,
  stripe_customer_id VARCHAR,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Imported products
CREATE TABLE imported_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id),
  source_url TEXT NOT NULL,
  source_domain VARCHAR,
  title TEXT,
  description TEXT,
  images JSONB,
  variants JSONB,
  source_price DECIMAL(10,2),
  currency VARCHAR DEFAULT 'USD',
  scrape_status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product listings (priced products)
CREATE TABLE product_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id),
  imported_product_id UUID REFERENCES imported_products(id),
  custom_title TEXT,
  selling_price DECIMAL(10,2),
  source_price_at_listing DECIMAL(10,2),
  status VARCHAR DEFAULT 'active',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer orders
CREATE TABLE customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id),
  product_listing_id UUID REFERENCES product_listings(id),
  storefront_order_id VARCHAR,
  customer_name VARCHAR,
  customer_email VARCHAR,
  shipping_address JSONB,
  selected_variant VARCHAR,
  quantity INTEGER DEFAULT 1,
  amount_paid DECIMAL(10,2),
  currency VARCHAR DEFAULT 'USD',
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auto-buy jobs
CREATE TABLE auto_buy_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_order_id UUID REFERENCES customer_orders(id),
  source_url TEXT,
  source_domain VARCHAR,
  source_order_id VARCHAR,
  amount_charged DECIMAL(10,2),
  status VARCHAR DEFAULT 'pending',
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  attempted_at TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- Shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_buy_job_id UUID REFERENCES auto_buy_jobs(id),
  tracking_number VARCHAR,
  carrier VARCHAR,
  tracking_url TEXT,
  mirror_status VARCHAR DEFAULT 'pending',
  shipped_at TIMESTAMP,
  mirrored_at TIMESTAMP
);

-- Webhook events log
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id),
  source VARCHAR,
  event_type VARCHAR,
  status VARCHAR DEFAULT 'pending',
  payload JSONB,
  error_msg TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new seller account |
| POST | `/api/auth/login` | Login and receive JWT token |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get all imported products |
| POST | `/api/products/import` | Import product from URL |
| GET | `/api/products/listings/all` | Get all listings with product data |
| GET | `/api/products/:id` | Get single product |
| PATCH | `/api/products/:id` | Update product title, description, images |
| DELETE | `/api/products/:id` | Delete product and its listings |
| POST | `/api/products/:id/list` | Create or update a listing with selling price |

### Listings

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/listings` | Get all listings |
| DELETE | `/api/listings/:id` | Remove a listing |

### Sellers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sellers/me` | Get current seller profile |
| PATCH | `/api/sellers/profile` | Update profile details |
| PATCH | `/api/sellers/password` | Change password |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:id` | Get single order |
| GET | `/api/orders/:id/status` | Get order + auto-buy job + shipment |
| PATCH | `/api/orders/:id/status` | Update order status |

### Stores

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/stores/shopify/connect` | Verify and connect Shopify store |
| POST | `/api/stores/shopify/push` | Push a listing to Shopify |

### Webhook

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/webhook/:secret` | Receive order from connected store |
| POST | `/api/webhook/tracking/:secret` | Receive tracking update |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check if backend is running |

---

## Deployment

### Backend on Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repo
3. Set the following:
   - **Root directory:** `onshipy-backend`
   - **Build command:** `npm install`
   - **Start command:** `node src/app.js`
4. Add all environment variables from the Backend section above
5. Click **Deploy**

### Frontend on Render

1. Create a new **Web Service** on Render
2. Connect the same GitHub repo
3. Set the following:
   - **Root directory:** `onshipy-frontend`
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
4. Add `NEXT_PUBLIC_API_URL` pointing to your backend Render URL
5. Click **Deploy**

> **Important:** Deploy the backend first and get its URL before deploying the frontend.

---

## How It Works

### Product Import Flow

```
Seller pastes URL
       ↓
Backend receives POST /api/products/import
       ↓
scraperService.js fetches the page using axios
       ↓
cheerio parses HTML for title, price, description, images
       ↓
Product saved to imported_products table
       ↓
Seller sees product in dashboard and products page
```

### Order Fulfillment Flow

```
Customer buys from seller's Shopify store
       ↓
Shopify sends webhook to POST /api/webhook/:secret
       ↓
Onshipy creates customer_order record
       ↓
Onshipy creates auto_buy_job record (status: pending)
       ↓
autoBuyWorker.js picks up job every 30 seconds
       ↓
Worker purchases from source website automatically
       ↓
Order status updated to processing → shipped → delivered
       ↓
Tracking number mirrored back to seller's store
```

### Shopify Push Flow

```
Seller clicks "Push to Shopify" on a listing
       ↓
Frontend calls POST /api/stores/shopify/push
       ↓
Backend calls Shopify Admin API to create product
       ↓
Product appears live in seller's Shopify store
       ↓
Product URL returned and shown to seller
```

---

## Roadmap

- [ ] WooCommerce integration
- [ ] Etsy integration  
- [ ] Amazon integration
- [ ] AI-powered description suggestions
- [ ] Price monitoring (auto-detect source price changes)
- [ ] Multi-store dashboard
- [ ] Stripe subscription billing
- [ ] Mobile app (React Native)
- [ ] Browser extension for one-click import
- [ ] Bulk import from CSV
- [ ] Custom storefront builder (no need for Shopify)
- [ ] Supplier credential management for auto-buy

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing patterns:
- Use `tokenRef` (not `useState`) for JWT tokens in frontend pages
- Use `API_BASE` variable for all API calls
- Each page imports and wraps its own `Layout` component
- No Playwright — use axios + cheerio for scraping only

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Contact

Built by Victor Abuchi  
GitHub: [@victorabuchi](https://github.com/victorabuchi)  
Platform: [onshipy.com](https://onshipy.com)
