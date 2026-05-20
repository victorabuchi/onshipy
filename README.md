<div align="center">
  <img src="https://onshipy.com/android-chrome-192x192.png" alt="Onshipy" width="80" height="80" />
  <h3>Onshipy</h3>
  <p><strong>Universal reselling &amp; dropshipping automation.</strong><br/>Import any product, set your price, sell through your own Shopify store.</p>
  <p>
    <a href="https://onshipy.com"><strong>onshipy.com</strong></a>
    &nbsp;&middot;&nbsp;
    <a href="https://api.onshipy.com">api.onshipy.com</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Stripe-Billing-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Stripe" />
    <img src="https://img.shields.io/badge/Shopify-Polaris-96BF48?style=flat-square&logo=shopify&logoColor=white" alt="Shopify Polaris" />
    <img src="https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square" alt="Render" />
    <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT" />
  </p>
</div>

## Overview

Onshipy lets sellers import products from any website — Nike, ASOS, Amazon, Zara, and thousands more — price them with a live profit calculator, and push them directly to their Shopify store. When a customer buys, Onshipy automatically purchases from the source and ships to the customer. No inventory. No manual order processing.

```
Seller pastes URL → Onshipy scrapes product → Seller sets price → Push to Shopify
                                                                         ↓
                                              Customer buys → Auto-purchase + ship
```

## Features

**Product Import**
- Import from any website via URL using axios + cheerio scraper
- Nike `__NEXT_DATA__` parser for accurate extraction
- Auto-detects currency (USD, EUR, GBP, AUD, CAD, JPY and more)
- Normalises EU decimal prices (`79,99€` → `€79.99`)
- Edit title, description and images after import
- Image lightbox with carousel

**Pricing & Listings**
- Set selling price manually or by profit margin %
- Live profit calculator (you pay / customer pays / your profit)
- Filter tabs: All, Active, On Shopify, Not pushed
- Sortable listing table with margin progress bars

**Store Integration**
- One-click Shopify OAuth (no token copying)
- Push single or all listings to Shopify in one click
- Webhook endpoint for any custom storefront
- WooCommerce and Etsy coming soon

**Browse**
- 48 product categories: Fashion, Streetwear, Electronics, Beauty, Skincare, Fragrance, Sports, Sneakers, Home, Watches, Bags, Amazon, Kids, Gaming, Food, Luxury, Jewelry, Outdoors, Fitness, Travel, Music, Photography, Office, Pets, Baby, Cycling, Running, Golf, Camping, Surf & Skate, Sunglasses, Tech Accessories, Swimwear, Denim, Menswear, Womenswear, Sustainable, Resale & Vintage, Stationery, Cooking, Coffee & Tea, Hair Care, Automotive, Anime & Manga, Collectibles, and more
- 900+ brands with trending indicators (20 brands per category)
- Auto-sliding trending spotlight per category
- Live activity feed showing real-time imports, sales and profits
- Per-brand landing page with step-by-step import guide

**Subscription Billing**
- Free, Pro ($29/mo) and Enterprise ($99/mo) plans
- Stripe Checkout with card, Apple Pay and Google Pay
- Stripe Customer Portal for invoice history and plan management
- Webhook-driven plan upgrades and downgrades (instant, no polling)
- `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` and `invoice.payment_failed` events handled
- Billing success page with auto-redirect to dashboard
- Plan badge on dashboard and Settings showing live plan status

**Analytics**
- KPI strip: gross sales, returning customer rate, fulfilled orders, total orders
- Total sales over time, sales breakdown and average order value
- Sessions, conversion rate and conversion funnel breakdown
- Top listings by profit, products by source

**Orders**
- Full orders view with Shopify-style analytics bar
- Tabs: All, Unfulfilled, Drafts, Abandoned
- Sortable table with payment and fulfilment status badges
- Slide-in order detail panel (full-screen on mobile)

**Customers**
- Segment tabs: All, Returning, Purchased once, High value
- Sortable table with colour-coded avatars
- Customer detail panel with order history

**Finance**
- Revenue overview with Shopify SVG empty state
- Ready for payout history and transaction ledger

**Settings**
- Sections: General, Plan, Billing, Users, Payments, Checkout, Notifications, Domains, Policies, Security
- Plan section shows pricing cards with one-click Stripe Checkout upgrade
- Billing section shows active plan, renewal date and Stripe Portal link
- Google OAuth sign-in
- Mobile-first layout: nav and content stack vertically on small screens

**UI**
- Shopify Polaris design tokens throughout
- Inter font, `rgba(48,48,48,1)` text, `font-weight: 450`
- Dark `#1a1a1a` topbar and sidebar with white card layout
- Custom delete confirmation modal (no browser `confirm()` dialogs)
- Horizontally scrollable stat and quick-action cards on mobile
- Side panels become full-screen overlays on mobile (≤767px)
- Fully responsive across all pages

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (pages router), React 19, CSS-in-JS |
| Icons | `@shopify/polaris-icons`, `@heroicons/react` |
| Backend | Node.js, Fastify, Knex |
| Database | PostgreSQL (Supabase) |
| Scraper | axios + cheerio |
| Auth | JWT + Google OAuth2 |
| Store | Shopify Admin API (OAuth) |
| Payments | Stripe (Checkout, Billing Portal, Webhooks) |
| Deployment | Render |
| Domain | Namecheap → onshipy.com |

## Project Structure

```
onshipy/
├── onshipy-backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/
│   │   │   ├── auth.js              # JWT + Google OAuth
│   │   │   ├── billing.js           # Stripe Checkout, Portal, Webhooks
│   │   │   ├── products.js          # Import, list, edit, delete
│   │   │   ├── orders.js            # Order management
│   │   │   ├── sellers.js           # Profile, password, /me
│   │   │   ├── stores.js            # Shopify OAuth + push
│   │   │   └── webhook.js           # Receive storefront orders
│   │   ├── services/
│   │   │   └── scraperService.js    # axios + cheerio scraper
│   │   └── workers/
│   │       └── autoBuyWorker.js     # Auto-buy engine (30s interval)
│   └── package.json
│
└── onshipy-frontend/
    ├── components/
    │   └── Layout.js                # Sidebar, topbar, search, notifications
    ├── pages/
    │   ├── dashboard.js             # Home: stats, getting started, quick actions
    │   ├── products.js              # Products + inventory, POs, transfers
    │   ├── listings.js              # Priced listings + push status
    │   ├── orders.js                # Orders + analytics bar
    │   ├── customers.js             # Customers + segments
    │   ├── analytics.js             # Full analytics dashboard
    │   ├── browse.js                # Brand browser (48 categories, 900+ brands)
    │   ├── online-store.js          # Store connect + push table
    │   ├── finance.js               # Finance overview
    │   ├── settings.js              # All settings sections incl. Plan + Billing
    │   ├── billing/
    │   │   └── success.js           # Post-checkout success page
    │   ├── login.js                 # Login + Google OAuth
    │   └── register.js              # Registration
    └── package.json
```

## Getting Started

**Prerequisites:** Node.js 18+, PostgreSQL (Supabase), Shopify Partner account, Google OAuth credentials, Stripe account

```bash
# Clone
git clone https://github.com/victorabuchi/onshipy.git
cd onshipy

# Backend
cd onshipy-backend
npm install
cp .env.example .env   # fill in values below
node src/app.js        # http://localhost:3000

# Frontend
cd ../onshipy-frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev            # http://localhost:3001
```

## Environment Variables

**Backend `.env`**
```env
PORT=3000
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:password@host:5432/dbname
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
BACKEND_URL=https://api.onshipy.com
FRONTEND_URL=https://onshipy.com
SHOPIFY_CLIENT_ID=your_shopify_client_id
SHOPIFY_CLIENT_SECRET=your_shopify_client_secret
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
ENCRYPTION_KEY=32_char_encryption_key
```

**Frontend `.env.local`**
```env
NEXT_PUBLIC_API_URL=https://api.onshipy.com
```

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in with email/password |
| `GET` | `/api/auth/google` | Initiate Google OAuth |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |

### Products
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/products/import` | Import product from URL |
| `GET` | `/api/products` | List all imported products |
| `PATCH` | `/api/products/:id` | Edit title, description, images |
| `DELETE` | `/api/products/:id` | Delete product |
| `POST` | `/api/products/:id/list` | Set selling price (create listing) |
| `GET` | `/api/products/listings/all` | Get all listings |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | Get all orders |
| `PATCH` | `/api/orders/:id` | Update order status |

### Store
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stores/shopify/install` | Start Shopify OAuth |
| `GET` | `/api/stores/shopify/callback` | Shopify OAuth callback |
| `GET` | `/api/stores/shopify/status` | Check connection status |
| `POST` | `/api/stores/shopify/push` | Push single listing to Shopify |
| `POST` | `/api/stores/shopify/push-all` | Push all unpushed listings |
| `DELETE` | `/api/stores/shopify/disconnect` | Disconnect store |

### Billing
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/billing/checkout` | Create Stripe Checkout session |
| `POST` | `/api/billing/portal` | Open Stripe Customer Portal |
| `GET` | `/api/billing/status` | Get plan, subscription status and renewal date |
| `POST` | `/api/billing/webhook` | Stripe webhook (raw body, signature verified) |

### Sellers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sellers/me` | Get current seller profile |
| `PATCH` | `/api/sellers/me` | Update name, email, store details |
| `POST` | `/api/sellers/change-password` | Change password |

### Webhook
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/webhook/:secret` | Receive order from any storefront |

### System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check + env status |

## Stripe Billing Flow

```
User clicks "Upgrade to Pro" in Settings → Plan
        ↓
POST /api/billing/checkout  (creates or reuses Stripe customer)
        ↓
Redirect to Stripe Checkout (card / Apple Pay / Google Pay)
        ↓
Stripe fires checkout.session.completed webhook
        ↓
Backend updates sellers.plan = 'pro' and subscription_status = 'active'
        ↓
User lands on /billing/success → redirected to dashboard
```

Cancellations, renewals and payment failures are handled automatically via `customer.subscription.updated`, `customer.subscription.deleted` and `invoice.payment_failed` webhook events.

## Deployment (Render)

**Backend**
```
Root directory:  onshipy-backend
Build command:   npm install
Start command:   node src/app.js
Custom domain:   api.onshipy.com
```

**Frontend**
```
Root directory:  onshipy-frontend
Build command:   npm install && npm run build
Start command:   npm start
Custom domain:   onshipy.com
```

**DNS (Namecheap)**
```
CNAME   @    onshipy-frontend.onrender.com
CNAME   www  onshipy-frontend.onrender.com
CNAME   api  onshipy-backend.onrender.com
```

**Stripe Webhook (Dashboard → Developers → Webhooks)**
```
Endpoint URL:  https://api.onshipy.com/api/billing/webhook
Events:        checkout.session.completed
               customer.subscription.updated
               customer.subscription.deleted
               invoice.payment_failed
```

## Engineering Notes

- **Auth tokens in `useRef`** — prevents stale closure bugs in async fetch callbacks where `useState` would capture a stale token value
- **No Playwright on Render free tier** — scraper uses axios + cheerio; Nike products parsed from `__NEXT_DATA__` JSON embedded in the page
- **Knex `.returning()` unreliable on updates** — always update then re-fetch rather than trusting the returned row
- **Shopify API via native `https` module** — more reliable than `fetch` on Render's infrastructure for outbound Shopify calls
- **EU decimal normalisation** — `79,99€` is converted before `parseFloat` to avoid NaN prices
- **Shopify OAuth nonce table** — prevents CSRF on the OAuth callback
- **Stripe webhook raw body** — Fastify configured with `rawBody: true` on the webhook route so `stripe.webhooks.constructEvent` can verify the signature
- **Stripe customer reuse** — `stripe_customer_id` stored on the seller row; same customer object reused across plan changes to preserve invoice history
- **Mobile side panels** — detail panels become `position: fixed; inset: 0` overlays on screens ≤767px
- **Custom delete modal** — native `window.confirm()` replaced with in-page modal on dashboard and products pages

## Database Schema

```sql
sellers                 -- user accounts, plan, stripe_customer_id, stripe_subscription_id
imported_products       -- scraped products
product_listings        -- priced listings
customer_orders         -- orders received via webhook / storefront
auto_buy_jobs           -- automation queue for the auto-buy worker
shipments               -- tracking information
webhook_events          -- raw incoming webhook payloads
```

## Roadmap

**Shipped**
- [x] Universal product scraper (axios + cheerio, Nike `__NEXT_DATA__`)
- [x] Shopify OAuth one-click connect + product push
- [x] Auto-buy worker engine
- [x] Google OAuth
- [x] Custom domains (onshipy.com / api.onshipy.com)
- [x] Shopify Polaris UI (exact design tokens)
- [x] Browse — 48 categories, 900+ brands, live activity feed
- [x] Full analytics dashboard with KPI strip and sparklines
- [x] Orders, Customers, Listings, Products, Finance pages
- [x] Settings with 9 sections including Plan and Billing
- [x] Stripe subscription billing (Free / Pro $29 / Enterprise $99)
- [x] Stripe Checkout, Customer Portal and Webhook handling
- [x] Billing success page with plan activation
- [x] Custom delete confirmation modals
- [x] Fully responsive — mobile side panels, scrollable cards

**Planned**
- [ ] Paystack (African market)
- [ ] WooCommerce, Etsy and Amazon integrations
- [ ] AI product description generator
- [ ] Price monitoring background job
- [ ] Real auto-buy checkout automation (per domain)
- [ ] Browser extension and mobile app

## License

MIT · Built by [Victor Abuchi](https://github.com/victorabuchi)
