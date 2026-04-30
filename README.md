# Onshipy

> **Universal Reselling & Dropshipping Automation SaaS**

Import products from any website, set your price, and sell through your own store. When a customer buys, Onshipy automatically purchases from the source and ships directly to them — zero inventory, zero manual work.

**Live:** [onshipy.com](https://onshipy.com) · **API:** [api.onshipy.com](https://api.onshipy.com)

---

## What it does

1. Seller pastes any product URL (Nike, ASOS, Amazon, Zara, etc.)
2. Onshipy scrapes title, price, description, images and variants instantly
3. Seller sets their selling price and profit margin
4. Seller connects their Shopify store with one click (OAuth)
5. Products are pushed directly to Shopify
6. Customer buys → Onshipy auto-purchases from source → ships to customer

No inventory. No manual orders. Fully automated.

---

## Features

**Product Management**
- Import from any website using a URL
- Smart scraper (axios + cheerio) with Nike `__NEXT_DATA__` parser
- EU decimal price fix (79,99€ → €79.99)
- Edit title, description and images after import
- Currency detection (USD, EUR, GBP, AUD, CAD, JPY and more)
- Image lightbox with carousel

**Pricing & Listings**
- Set selling price manually or by profit margin %
- Live profit calculator (you pay / customer pays / profit)
- Filter tabs — All, Active, On Shopify, Not pushed
- Sortable table with margin progress bars

**Store Integration**
- One-click Shopify OAuth connect (no token copying)
- Push products directly to Shopify
- Push all unpushed listings in one click
- Webhook system for any custom store
- WooCommerce, Etsy, Amazon — coming soon

**Browse**
- 12 categories: Fashion, Electronics, Beauty, Sports, Sneakers, Home, Watches, Bags, Amazon, Kids, Gaming, Food
- 100+ brands with trending indicators
- Animated trending spotlight (auto-slides)
- Live activity notifications (imports, sales, profits)
- Smart brand landing page with step-by-step import guide

**Analytics**
- Shopify-style analytics bar (KPI strip with sparklines)
- Total sales, sessions, orders, conversion rate
- Total sales breakdown, store metrics, top listings by profit
- Products by source

**Orders**
- Shopify-exact orders page with analytics bar
- Tabs: All, Unfulfilled, Drafts, Abandoned checkouts
- Sortable table with payment + fulfillment status
- Order detail panel

**Customers**
- Segment tabs — All, Returning, Purchased once, High value
- Sortable table with color-coded avatars
- Customer detail panel with order history

**Online Store**
- Sales channels sub-nav (Themes, Pages, Preferences)
- One-click Shopify OAuth connect
- Push table with progress bar
- Webhook config

**Account & Settings**
- Shopify-style settings (General, Plan, Billing, Users, Payments, Checkout, Notifications, Domains, Policies, Security)
- Google OAuth sign in — shows "Continue to onshipy.com"
- Fully responsive (mobile, tablet, desktop)

**UI/UX**
- Exact Shopify Polaris design tokens
- Inter font, `rgba(48,48,48,1)` text, `font-weight: 450`
- Black outer background (`#1a1a1a`) with white sidebar card (curved top-right corner)
- Pill-shaped active nav items (`border-radius: 10px`)
- Centered pill search bar in black topbar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (pages router), React, CSS-in-JS |
| Backend | Node.js, Fastify, Knex |
| Database | PostgreSQL via Supabase |
| Scraper | axios + cheerio (Nike `__NEXT_DATA__` parser) |
| Auth | JWT + Google OAuth2 |
| Store | Shopify Admin API (OAuth) |
| Deployment | Render (backend + frontend) |
| Domain | onshipy.com (Namecheap) |

---

## Project Structure

```
onshipy/
├── onshipy-backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/
│   │   │   ├── auth.js          # JWT + Google OAuth
│   │   │   ├── products.js      # Import, list, edit, delete
│   │   │   ├── orders.js        # Order management
│   │   │   ├── stores.js        # Shopify OAuth + push
│   │   │   └── webhook.js       # Receive orders
│   │   ├── services/
│   │   │   └── scraperService.js # axios + cheerio scraper
│   │   └── workers/
│   │       └── autoBuyWorker.js  # Auto-buy engine (30s interval)
│   └── package.json
│
└── onshipy-frontend/
    ├── components/
    │   └── Layout.js            # Shopify-style sidebar + topbar
    ├── pages/
    │   ├── dashboard.js         # Home
    │   ├── products.js          # Products + sub-sections
    │   ├── orders.js            # Orders + analytics bar
    │   ├── customers.js         # Customers + segments
    │   ├── listings.js          # Listings + push
    │   ├── analytics.js         # Full analytics
    │   ├── browse.js            # Brand browser (12 categories)
    │   ├── online-store.js      # Store connect + push
    │   ├── settings.js          # Settings
    │   ├── wallet.js            # Billing
    │   ├── plans.js             # Plans
    │   ├── login.js             # Login + Google OAuth
    │   └── register.js          # Register
    └── package.json
```

---

## Database Schema

```sql
sellers              -- user accounts
imported_products    -- scraped products
product_listings     -- priced listings
customer_orders      -- orders received
auto_buy_jobs        -- automation queue
shipments            -- tracking info
webhook_events       -- incoming webhooks
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/victorabuchi/onshipy.git

# Backend
cd onshipy/onshipy-backend
npm install
cp .env.example .env   # fill in values
node src/app.js        # http://localhost:3000

# Frontend
cd ../onshipy-frontend
npm install
# create .env.local → NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev            # http://localhost:3001
```

---

## Environment Variables

**Backend `.env`**
```env
PORT=3000
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://...supabase...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
BACKEND_URL=https://api.onshipy.com
FRONTEND_URL=https://www.onshipy.com
SHOPIFY_CLIENT_ID=your_shopify_client_id
SHOPIFY_CLIENT_SECRET=your_shopify_client_secret
STRIPE_SECRET_KEY=sk_live_xxx
ENCRYPTION_KEY=32_char_encryption_key
```

**Frontend `.env.local`**
```env
NEXT_PUBLIC_API_URL=https://api.onshipy.com
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### Products
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/products/import` | Import product from URL |
| GET | `/api/products` | List all imported products |
| PATCH | `/api/products/:id` | Edit title/description/images |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/:id/list` | Set selling price (create listing) |
| GET | `/api/products/listings/all` | Get all listings |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | Get all orders |
| PATCH | `/api/orders/:id` | Update order status |

### Store
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stores/shopify/install` | Start Shopify OAuth |
| GET | `/api/stores/shopify/callback` | Shopify OAuth callback |
| GET | `/api/stores/shopify/status` | Check connection status |
| POST | `/api/stores/shopify/push` | Push single listing |
| POST | `/api/stores/shopify/push-all` | Push all unpushed listings |
| DELETE | `/api/stores/shopify/disconnect` | Disconnect store |

### Webhook
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/webhook/:secret` | Receive order from any store |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check + env status |

---

## Deployment (Render)

**Backend** (`onshipy-backend`)
- Root dir: `onshipy-backend`
- Build: `npm install`
- Start: `node src/app.js`
- Custom domain: `api.onshipy.com`

**Frontend** (`onshipy-frontend`)
- Root dir: `onshipy-frontend`
- Build: `npm install && npm run build`
- Start: `npm start`
- Custom domain: `onshipy.com`

**DNS (Namecheap)**
```
CNAME  @    onshipy-frontend.onrender.com
CNAME  www  onshipy-frontend.onrender.com
CNAME  api  onshipy-backend.onrender.com
```

---

## Key Engineering Notes

- `useRef` (not `useState`) for auth tokens in async callbacks — prevents stale closure bugs
- Playwright not supported on Render free plan — use axios + cheerio
- Knex `.returning()` unreliable on updates — always update then re-fetch
- Native Node `https` module more reliable than `fetch` for Shopify API calls on Render
- EU comma decimals (79,99€) normalized before parsing
- Shopify OAuth uses nonce table for CSRF protection

---

## Roadmap

- [x] Universal product scraper (axios + cheerio)
- [x] Shopify OAuth one-click connect
- [x] Shopify product push
- [x] Auto-buy worker engine
- [x] Google OAuth ("Continue to onshipy.com")
- [x] Custom domain (onshipy.com + api.onshipy.com)
- [x] Shopify-exact UI (Polaris design tokens)
- [x] Browse (12 categories, 100+ brands, live activity)
- [x] Analytics with KPI strip + sparklines
- [x] Orders with Shopify analytics bar
- [x] Customers with segments
- [x] Listings with push status
- [x] Products with sub-sections (Inventory, POs, Transfers, Gift cards)
- [ ] Stripe subscription billing (Free / Pro $29 / Enterprise $99)
- [ ] Paystack (African market)
- [ ] WooCommerce integration
- [ ] Etsy integration
- [ ] Amazon integration
- [ ] AI product description generator
- [ ] Price monitoring background job
- [ ] Tracking mirror (push tracking back to storefront)
- [ ] Real auto-buy checkout automation (per-domain)
- [ ] Browser extension
- [ ] Mobile app

---

MIT License · Built by [Victor Abuchi](https://github.com/victorabuchi)
