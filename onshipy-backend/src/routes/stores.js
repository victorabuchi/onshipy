require('dotenv').config();
const db = require('../db/knex');
const crypto = require('crypto');
const https = require('https');

module.exports = async function storesRoutes(fastify) {

  const authenticate = async (req, reply) => {
    try { await req.jwtVerify(); }
    catch { return reply.status(401).send({ error: 'Unauthorized' }); }
  };

  const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
  const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
  const BACKEND_URL = process.env.BACKEND_URL || 'https://api.onshipy.com';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://onshipy.com';
  const SCOPES = 'read_products,write_products,read_orders,write_orders,read_inventory';

  // ── Helper: make HTTPS request to Shopify ──
  const shopifyRequest = (hostname, path, method = 'GET', token = null, body = null) => {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['X-Shopify-Access-Token'] = token;
      const bodyStr = body ? JSON.stringify(body) : null;
      if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);

      const req = https.request({ hostname, path, method, headers }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on('error', reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  };

  // ── STEP 1: Start OAuth — redirect seller to Shopify ──
  // GET /api/stores/shopify/install?shop=mystore.myshopify.com
  fastify.get('/shopify/install', { preHandler: authenticate }, async (req, reply) => {
    const { shop } = req.query;
    if (!shop) return reply.status(400).send({ error: 'shop parameter required' });

    // Normalize shop domain
    let shopDomain = shop.trim().toLowerCase()
      .replace('https://', '').replace('http://', '').replace(/\/$/, '');
    if (!shopDomain.includes('.myshopify.com')) {
      shopDomain = shopDomain + '.myshopify.com';
    }

    // Generate nonce to prevent CSRF
    const nonce = crypto.randomBytes(16).toString('hex');
    const sellerId = req.user.id;

    // Store nonce in DB
    await db('shopify_oauth_nonces').insert({
      nonce,
      seller_id: sellerId,
      shop: shopDomain,
      created_at: new Date()
    }).onConflict('seller_id').merge();

    const redirectUri = `${BACKEND_URL}/api/stores/shopify/callback`;
    const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;

    return reply.send({ url: authUrl });
  });

  // ── STEP 2: OAuth Callback — Shopify redirects here ──
  // GET /api/stores/shopify/callback?code=...&shop=...&state=...
  fastify.get('/shopify/callback', async (req, reply) => {
    const { code, shop, state, hmac } = req.query;

    if (!code || !shop || !state) {
      return reply.redirect(`${FRONTEND_URL}/online-store?error=missing_params`);
    }

    try {
      // Verify nonce
      const nonceRecord = await db('shopify_oauth_nonces').where({ nonce: state, shop }).first();
      if (!nonceRecord) {
        return reply.redirect(`${FRONTEND_URL}/online-store?error=invalid_state`);
      }

      const sellerId = nonceRecord.seller_id;

      // Verify HMAC signature from Shopify
      const params = { ...req.query };
      delete params.hmac;
      delete params.signature;
      const message = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
      const digest = crypto.createHmac('sha256', SHOPIFY_CLIENT_SECRET).update(message).digest('hex');
      if (digest !== hmac) {
        return reply.redirect(`${FRONTEND_URL}/online-store?error=invalid_hmac`);
      }

      // Exchange code for access token
      const tokenRes = await shopifyRequest(shop, '/admin/oauth/access_token', 'POST', null, {
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code
      });

      if (!tokenRes.body.access_token) {
        return reply.redirect(`${FRONTEND_URL}/online-store?error=token_exchange_failed`);
      }

      const accessToken = tokenRes.body.access_token;

      // Get shop info
      const shopRes = await shopifyRequest(shop, '/admin/api/2024-01/shop.json', 'GET', accessToken);
      const shopName = shopRes.body?.shop?.name || shop;

      // Save to DB
      await db('sellers').where({ id: sellerId }).update({
        shopify_store_url: shop,
        shopify_access_token: accessToken,
        shopify_shop_name: shopName,
        shopify_connected_at: new Date()
      });

      // Clean up nonce
      await db('shopify_oauth_nonces').where({ nonce: state }).delete();

      // Redirect back to frontend with success
      return reply.redirect(`${FRONTEND_URL}/online-store?shopify=connected&shop=${encodeURIComponent(shopName)}`);

    } catch (err) {
      console.error('Shopify callback error:', err.message);
      return reply.redirect(`${FRONTEND_URL}/online-store?error=server_error`);
    }
  });

  // ── GET /api/stores/shopify/status — check connection ──
  fastify.get('/shopify/status', { preHandler: authenticate }, async (req, reply) => {
    try {
      const seller = await db('sellers').where({ id: req.user.id }).first();
      if (!seller.shopify_store_url || !seller.shopify_access_token) {
        return reply.send({ connected: false });
      }
      return reply.send({
        connected: true,
        shop: seller.shopify_store_url,
        shop_name: seller.shopify_shop_name,
        connected_at: seller.shopify_connected_at
      });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // ── DELETE /api/stores/shopify — disconnect ──
  fastify.delete('/shopify', { preHandler: authenticate }, async (req, reply) => {
    try {
      await db('sellers').where({ id: req.user.id }).update({
        shopify_store_url: null,
        shopify_access_token: null,
        shopify_shop_name: null,
        shopify_connected_at: null
      });
      return reply.send({ success: true });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // ── POST /api/stores/shopify/push — push product to Shopify ──
  fastify.post('/shopify/push', { preHandler: authenticate }, async (req, reply) => {
    const { listing_id } = req.body;
    const sellerId = req.user.id;

    try {
      const seller = await db('sellers').where({ id: sellerId }).first();
      if (!seller.shopify_store_url || !seller.shopify_access_token) {
        return reply.status(400).send({ error: 'Shopify store not connected' });
      }

      const listing = await db('product_listings')
        .join('imported_products', 'product_listings.imported_product_id', 'imported_products.id')
        .where('product_listings.id', listing_id)
        .where('product_listings.seller_id', sellerId)
        .select('product_listings.*', 'imported_products.title', 'imported_products.description', 'imported_products.images', 'imported_products.source_price', 'imported_products.currency')
        .first();

      if (!listing) return reply.status(404).send({ error: 'Listing not found' });

      const images = (() => {
        try { return typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images || []; }
        catch { return []; }
      })();

      const productPayload = {
        product: {
          title: listing.custom_title || listing.title,
          body_html: listing.description || '',
          vendor: 'Onshipy',
          product_type: 'Dropship',
          status: 'active',
          variants: [{ price: listing.selling_price?.toString(), inventory_management: null }],
          images: images.slice(0, 5).map(src => ({ src }))
        }
      };

      const result = await shopifyRequest(
        seller.shopify_store_url,
        '/admin/api/2024-01/products.json',
        'POST',
        seller.shopify_access_token,
        productPayload
      );

      if (result.status !== 201) {
        return reply.status(400).send({ error: 'Shopify push failed', details: result.body });
      }

      const shopifyProductId = result.body.product?.id;
      await db('product_listings').where({ id: listing_id }).update({
        shopify_product_id: shopifyProductId,
        shopify_pushed_at: new Date()
      });

      return reply.send({ success: true, shopify_product_id: shopifyProductId });
    } catch (err) {
      console.error('Push error:', err.message);
      return reply.status(500).send({ error: err.message });
    }
  });
};