# Onshipy

> **Universal Reselling & Dropshipping Automation Platform**

Import products from any website, set your price, and sell through your own store. When a customer buys, Onshipy automatically purchases from the source and ships directly to them — zero inventory, zero manual work.

**Live:** [onshipy-frontend.onrender.com](https://onshipy-frontend.onrender.com)

---

## What it does

1. Seller pastes any product URL (Nike, ASOS, Amazon, Zara, etc.)
2. Onshipy scrapes title, price, description, and images instantly
3. Seller sets their selling price and profit margin
4. Seller pushes the product to their Shopify or WooCommerce store
5. Customer buys → Onshipy auto-purchases from source → ships to customer

No inventory. No manual orders. Fully automated.

---

## Features

**Product Management**
- Import from any website using a URL
- Smart scraper extracts title, price, description, images automatically
- Edit title, description and images after import
- Currency detection (USD, EUR, GBP, AUD, CAD and more)

**Pricing & Listings**
- Set selling price manually or by profit margin %
- Live profit calculator
- Manage all active listings with margin display

**Store Integration**
- Connect Shopify via Admin API
- Push products directly to Shopify with one click
- WooCommerce, Etsy, Amazon integrations coming
- Webhook system for any custom store

**Automation**
- Auto-buy engine — purchases from source when order received
- Order tracking and status management
- Tracking mirrored back to your store

**Analytics & CRM**
- Revenue and profit tracking
- Customer profiles with order history
- Source breakdown and top listings

**Account & Settings**
- Shopify-style settings (General, Plan, Billing, Users, Payments, Notifications, Domains, Policies)
- Google OAuth sign in
- Fully responsive (mobile, tablet, desktop)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, CSS-in-JS |
| Backend | Node.js, Fastify |
| Database | PostgreSQL via Supabase |
| Scraper | axios + cheerio |
| Auth | JWT + Google OAuth2 |
| Deployment | Render |

---

## Getting Started

```bash
# Clone
git clone https://github.com/victorabuchi/onshipy.git

# Backend
cd onshipy/onshipy-backend
npm install
# add .env (see below)
npm run dev  # http://localhost:3000

# Frontend
cd ../onshipy-frontend
npm install
# add .env.local with NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev  # http://localhost:3001
```

---

## Environment Variables

**Backend `.env`**
```
PORT=3000
JWT_SECRET=your_secret
DATABASE_URL=your_supabase_url
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com
STRIPE_SECRET_KEY=sk_live_xxx
ENCRYPTION_KEY=32_char_key
```

**Frontend `.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/google` | Google OAuth |
| POST | `/api/products/import` | Import from URL |
| GET | `/api/products` | List products |
| PATCH | `/api/products/:id` | Edit product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/:id/list` | Set price |
| GET | `/api/orders` | Get orders |
| POST | `/api/stores/shopify/connect` | Connect Shopify |
| POST | `/api/stores/shopify/push` | Push to Shopify |
| POST | `/api/webhook/:secret` | Receive orders |
| GET | `/health` | Health check |

---

## Render Deployment

**Backend:** Root dir `onshipy-backend` · Build `npm install` · Start `node src/app.js`

**Frontend:** Root dir `onshipy-frontend` · Build `npm install && npm run build` · Start `npm start`

---

## Roadmap

- [x] Universal product scraper
- [x] Shopify push integration
- [x] Auto-buy worker engine
- [x] Google OAuth
- [x] Responsive mobile layout
- [x] Niche brand browser
- [ ] Stripe billing
- [ ] WooCommerce integration
- [ ] Etsy + Amazon
- [ ] Paystack
- [ ] AI descriptions
- [ ] Price monitor
- [ ] Browser extension
- [ ] Mobile app

---

MIT License · Built by [Victor Abuchi](https://github.com/victorabuchi)
