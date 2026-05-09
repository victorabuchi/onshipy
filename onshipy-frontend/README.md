<div align="center">
  <h1>Onshipy</h1>
  <p><strong>Universal reselling &amp; dropshipping automation.</strong><br/>Import any product, set your price, sell through your own Shopify store.</p>
  <p>
    <a href="https://onshipy.com"><strong>onshipy.com</strong></a>
    &nbsp;&middot;&nbsp;
    <a href="https://api.onshipy.com">api.onshipy.com</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
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

### Product Import
- Import from any website via URL (axios + cheerio scraper)
- Nike `__NEXT_DATA__` parser for accurate extraction
- Auto-detects currency (USD, EUR, GBP, AUD, CAD, JPY, and more)
- Normalises EU decimal prices (`79,99€` → `€79.99`)
- Edit title, description, and images after import
- Image lightbox with carousel

### Pricing & Listings
- Set selling price manually or by profit margin %
- Live profit calculator (you pay / customer pays / your profit)
- Filter tabs — All, Active, On Shopify, Not pushed
- Sortable listing table with margin progress bars

### Store Integration
- One-click Shopify OAuth (no token copying)
- Push single or all listings to Shopify in one click
- Webhook endpoint for any custom storefront
- WooCommerce, Etsy — coming soon

### Browse
- 12 product categories: Fashion, Electronics, Beauty, Sports, Sneakers, Home, Watches, Bags, Amazon, Kids, Gaming, Food
- 100+ brands with trending indicators
- Auto-sliding trending spotlight
- Live activity feed (imports, sales, profits)
- Per-brand landing page with step-by-step import guide

### Analytics
- KPI strip: gross sales, returning customer rate, fulfilled orders, total orders
- Total sales over time, sales breakdown, average order value
- Sessions, conversion rate, conversion funnel breakdown
- Top listings by profit, products by source

### Orders
- Full orders view with Shopify-style analytics bar
- Tabs: All, Unfulfilled, Drafts, Abandoned
- Sortable table with payment and fulfilment status badges
- Slide-in order detail panel (full-screen on mobile)

### Customers
- Segment tabs — All, Returning, Purchased once, High value
- Sortable table with colour-coded avatars
- Customer detail panel with order history

### Settings
- General, Plan & Billing, Users, Payments, Checkout, Notifications, Domains, Policies, Security
- Google OAuth sign-in
- Mobile-first: nav and content stack vertically on small screens

### UI
- Shopify Polaris design tokens throughout
- Inter font · `rgba(48,48,48,1)` text · `font-weight: 450`
- Dark `#1a1a1a` topbar + sidebar with white card layout
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
| Payments | Stripe |
| Deployment | Render |
| Domain | Namecheap → onshipy.com |

## Project Structure

```
onshipy-frontend/
├── components/
│   └── Layout.js                # Sidebar, topbar, search, notifications
├── pages/
│   ├── dashboard.js             # Home — stats, getting started, quick actions
│   ├── products.js              # Products + inventory, POs, transfers
│   ├── listings.js              # Priced listings + push status
│   ├── orders.js                # Orders + analytics bar
│   ├── customers.js             # Customers + segments
│   ├── analytics.js             # Full analytics dashboard
│   ├── browse.js                # Brand browser (12 categories, 100+ brands)
│   ├── online-store.js          # Store connect + push table
│   ├── settings.js              # All settings sections
│   ├── wallet.js                # Wallet / billing
│   ├── login.js                 # Login + Google OAuth
│   └── register.js              # Registration
└── package.json
```

## Getting Started

```bash
cd onshipy-frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev   # http://localhost:3001
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.onshipy.com
```

## Engineering Notes

- **Auth tokens in `useRef`** — prevents stale closure bugs in async fetch callbacks where `useState` would capture a stale token value
- **Mobile side panels** — detail panels become `position: fixed; inset: 0` overlays on screens ≤767px
- **CSS media query classes** — responsive grids use `className` + `<style>` block approach to override inline styles at breakpoints

## Roadmap

**Shipped**
- [x] Universal product scraper (axios + cheerio, Nike `__NEXT_DATA__`)
- [x] Shopify OAuth one-click connect + product push
- [x] Auto-buy worker engine
- [x] Google OAuth
- [x] Shopify Polaris UI (exact design tokens)
- [x] Browse — 12 categories, 100+ brands, live activity feed
- [x] Full analytics dashboard with KPI strip + sparklines
- [x] Orders, Customers, Listings, Products pages
- [x] Settings (9 sections)
- [x] Fully responsive — mobile side panels, scrollable cards

**Planned**
- [ ] Stripe subscription billing (Free · Pro $29 · Enterprise $99)
- [ ] Paystack (African market)
- [ ] WooCommerce · Etsy · Amazon integrations
- [ ] AI product description generator
- [ ] Price monitoring background job
- [ ] Real auto-buy checkout automation (per-domain)
- [ ] Browser extension · Mobile app

## License

MIT · Built by [Victor Abuchi](https://github.com/victorabuchi)
