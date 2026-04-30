const db = require('../db/knex');
const https = require('https');

module.exports = async function (fastify) {

  const authenticate = async (req, reply) => {
    try { await req.jwtVerify(); }
    catch (err) { return reply.status(401).send({ error: 'Unauthorized' }); }
  };

  // ─── Generic HTTPS helper ────────────────────────────────────────────────
  const httpsRequest = (options, body = null) => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on('error', reject);
      if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
      req.end();
    });
  };

  // ─── Clean Shopify domain ────────────────────────────────────────────────
  const cleanShopDomain = (raw) =>
    raw.replace(/https?:\/\//, '').replace(/\/$/, '').trim();

  // ─── Build auth header ───────────────────────────────────────────────────
  const shopifyAuthHeader = (token) =>
    token.startsWith('shpat_') || token.startsWith('shpca_')
      ? { 'X-Shopify-Access-Token': token }
      : { 'X-Shopify-Access-Token': token }; // always use token header

  // ════════════════════════════════════════════════════════════════════════
  // POST /api/stores/shopify/connect  — verify credentials & save to DB
  // ════════════════════════════════════════════════════════════════════════
  fastify.post('/shopify/connect', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const { shop_url, access_token } = req.body;

    if (!shop_url || !access_token) {
      return reply.status(400).send({ error: 'shop_url and access_token are required' });
    }

    const cleanUrl = cleanShopDomain(shop_url);

    try {
      // Verify credentials by calling shop endpoint
      const result = await httpsRequest({
        hostname: cleanUrl,
        path: '/admin/api/2024-01/shop.json',
        method: 'GET',
        headers: {
          ...shopifyAuthHeader(access_token),
          'Content-Type': 'application/json'
        }
      });

      if (result.status === 401) {
        return reply.status(401).send({
          error: 'Invalid access token. Make sure you copied the full Admin API access token from your Shopify app.'
        });
      }
      if (result.status === 404) {
        return reply.status(404).send({
          error: 'Store not found. Double-check your store URL (e.g. my-store.myshopify.com).'
        });
      }
      if (result.status !== 200) {
        return reply.status(400).send({
          error: `Shopify returned ${result.status}. Check your store URL and access token.`
        });
      }

      const shopData = result.body.shop;

      // Save/update to sellers table
      await db('sellers').where({ id: seller_id }).update({
        shopify_store_url: cleanUrl,
        shopify_access_token: access_token,
        shopify_shop_name: shopData?.name || cleanUrl,
        shopify_connected_at: new Date()
      });

      return reply.send({
        success: true,
        shop: {
          name: shopData?.name,
          url: cleanUrl,
          email: shopData?.email,
          currency: shopData?.currency,
          plan: shopData?.plan_display_name,
          connected_at: new Date().toISOString()
        }
      });

    } catch (err) {
      return reply.status(500).send({
        error: 'Could not reach Shopify. Check your store URL and internet connection. Details: ' + err.message
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════
  // GET /api/stores/shopify/status  — check if connected
  // ════════════════════════════════════════════════════════════════════════
  fastify.get('/shopify/status', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const seller = await db('sellers').where({ id: seller_id }).first();

    if (!seller?.shopify_store_url || !seller?.shopify_access_token) {
      return reply.send({ connected: false });
    }

    return reply.send({
      connected: true,
      shop: {
        name: seller.shopify_shop_name,
        url: seller.shopify_store_url,
        connected_at: seller.shopify_connected_at
      }
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // DELETE /api/stores/shopify/disconnect
  // ════════════════════════════════════════════════════════════════════════
  fastify.delete('/shopify/disconnect', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    await db('sellers').where({ id: seller_id }).update({
      shopify_store_url: null,
      shopify_access_token: null,
      shopify_shop_name: null,
      shopify_connected_at: null
    });
    return reply.send({ success: true });
  });

  // ════════════════════════════════════════════════════════════════════════
  // POST /api/stores/shopify/push  — push listing to Shopify
  // ════════════════════════════════════════════════════════════════════════
  fastify.post('/shopify/push', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const { listing_id, shop_url: bodyShopUrl, access_token: bodyToken } = req.body;

    if (!listing_id) {
      return reply.status(400).send({ error: 'listing_id is required' });
    }

    // Use stored credentials if not passed in body
    const seller = await db('sellers').where({ id: seller_id }).first();
    const shop_url = bodyShopUrl || seller?.shopify_store_url;
    const access_token = bodyToken || seller?.shopify_access_token;

    if (!shop_url || !access_token) {
      return reply.status(400).send({
        error: 'No Shopify store connected. Please connect your store first.'
      });
    }

    try {
      const listing = await db('product_listings')
        .join('imported_products', 'product_listings.imported_product_id', 'imported_products.id')
        .where({ 'product_listings.id': listing_id, 'product_listings.seller_id': seller_id })
        .select(
          'product_listings.*',
          'imported_products.title',
          'imported_products.description',
          'imported_products.images',
          'imported_products.variants',
          'imported_products.source_url',
          'imported_products.source_domain',
          'imported_products.currency'
        )
        .first();

      if (!listing) return reply.status(404).send({ error: 'Listing not found' });

      // ── Build images array ─────────────────────────────────────────────
      const rawImages = (() => {
        try {
          return typeof listing.images === 'string'
            ? JSON.parse(listing.images)
            : (listing.images || []);
        } catch { return []; }
      })();

      const shopifyImages = [];
      for (const src of rawImages.slice(0, 5)) {
        if (!src || typeof src !== 'string') continue;
        if (src.startsWith('data:image')) {
          const base64 = src.split(',')[1];
          if (base64) shopifyImages.push({ attachment: base64 });
        } else if (src.startsWith('http') && !src.includes('localhost')) {
          shopifyImages.push({ src });
        }
      }

      // ── Build variants ─────────────────────────────────────────────────
      const rawVariants = (() => {
        try {
          return typeof listing.variants === 'string'
            ? JSON.parse(listing.variants)
            : (listing.variants || []);
        } catch { return []; }
      })();

      // Group variants by option name
      const optionGroups = {};
      for (const v of rawVariants) {
        if (!optionGroups[v.option]) optionGroups[v.option] = [];
        if (!optionGroups[v.option].includes(v.value)) {
          optionGroups[v.option].push(v.value);
        }
      }

      const optionNames = Object.keys(optionGroups).slice(0, 3);
      const shopifyOptions = optionNames.map(name => ({
        name,
        values: optionGroups[name]
      }));

      // Build cartesian product of variants (up to 100 — Shopify limit)
      let shopifyVariants = [{ price: parseFloat(listing.selling_price).toFixed(2) }];

      if (optionNames.length > 0) {
        const allCombos = (arrays) => {
          return arrays.reduce((acc, arr) =>
            acc.flatMap(combo => arr.map(val => [...combo, val])),
            [[]]
          );
        };
        const combos = allCombos(optionNames.map(n => optionGroups[n])).slice(0, 100);
        shopifyVariants = combos.map(combo => {
          const variant = { price: parseFloat(listing.selling_price).toFixed(2) };
          combo.forEach((val, i) => { variant[`option${i + 1}`] = val; });
          return variant;
        });
      }

      // Final variant defaults
      shopifyVariants = shopifyVariants.map(v => ({
        ...v,
        inventory_management: null,
        fulfillment_service: 'manual',
        requires_shipping: true,
        taxable: true
      }));

      // ── Build product body ─────────────────────────────────────────────
      const productBody = {
        product: {
          title: listing.custom_title || listing.title,
          body_html: `<p>${(listing.description || '').replace(/\n/g, '<br>')}</p>`,
          vendor: 'Onshipy',
          product_type: 'Dropship',
          tags: `onshipy,dropship,${listing.source_domain || ''}`,
          status: 'active',
          images: shopifyImages,
          options: shopifyOptions.length > 0 ? shopifyOptions : undefined,
          variants: shopifyVariants
        }
      };

      const cleanUrl = cleanShopDomain(shop_url);
      const bodyStr = JSON.stringify(productBody);

      const result = await httpsRequest({
        hostname: cleanUrl,
        path: '/admin/api/2024-01/products.json',
        method: 'POST',
        headers: {
          ...shopifyAuthHeader(access_token),
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr)
        }
      }, bodyStr);

      if (result.status === 422) {
        const errors = result.body?.errors;
        return reply.status(422).send({
          error: 'Shopify rejected the product: ' + JSON.stringify(errors)
        });
      }

      if (result.status !== 200 && result.status !== 201) {
        return reply.status(result.status).send({
          error: result.body?.errors
            ? 'Shopify error: ' + JSON.stringify(result.body.errors)
            : `Shopify returned status ${result.status}`
        });
      }

      const shopifyProduct = result.body.product;
      const productUrl = `https://${cleanUrl}/products/${shopifyProduct?.handle}`;

      // Mark listing as pushed
      await db('product_listings').where({ id: listing_id }).update({
        shopify_product_id: String(shopifyProduct?.id || ''),
        shopify_pushed_at: new Date(),
        status: 'active'
      });

      return reply.send({
        success: true,
        shopify_product_id: shopifyProduct?.id,
        product_url: productUrl,
        handle: shopifyProduct?.handle,
        variants_created: shopifyVariants.length
      });

    } catch (err) {
      return reply.status(500).send({ error: 'Push failed: ' + err.message });
    }
  });

  // ════════════════════════════════════════════════════════════════════════
  // POST /api/stores/shopify/push-all  — push all active listings at once
  // ════════════════════════════════════════════════════════════════════════
  fastify.post('/shopify/push-all', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const seller = await db('sellers').where({ id: seller_id }).first();

    if (!seller?.shopify_store_url) {
      return reply.status(400).send({ error: 'No Shopify store connected.' });
    }

    const listings = await db('product_listings')
      .where({ seller_id, status: 'active' })
      .whereNull('shopify_product_id');

    const results = { pushed: 0, failed: 0, errors: [] };

    for (const listing of listings) {
      try {
        const pushRes = await fastify.inject({
          method: 'POST',
          url: '/api/stores/shopify/push',
          headers: req.headers,
          payload: { listing_id: listing.id }
        });
        const data = JSON.parse(pushRes.payload);
        if (data.success) results.pushed++;
        else { results.failed++; results.errors.push({ listing_id: listing.id, error: data.error }); }
      } catch (err) {
        results.failed++;
        results.errors.push({ listing_id: listing.id, error: err.message });
      }
    }

    return reply.send({ success: true, ...results, total: listings.length });
  });

  // ════════════════════════════════════════════════════════════════════════
  // GET /api/stores/shopify/products — list products already on Shopify
  // ════════════════════════════════════════════════════════════════════════
  fastify.get('/shopify/products', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const seller = await db('sellers').where({ id: seller_id }).first();

    if (!seller?.shopify_store_url) {
      return reply.status(400).send({ error: 'No Shopify store connected.' });
    }

    try {
      const result = await httpsRequest({
        hostname: seller.shopify_store_url,
        path: '/admin/api/2024-01/products.json?limit=50',
        method: 'GET',
        headers: {
          ...shopifyAuthHeader(seller.shopify_access_token),
          'Content-Type': 'application/json'
        }
      });

      return reply.send({ products: result.body?.products || [] });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // ════════════════════════════════════════════════════════════════════════
  // Webhook endpoint — receive orders from any store
  // ════════════════════════════════════════════════════════════════════════
  fastify.post('/webhook/:secret', async (req, reply) => {
    const { secret } = req.params;
    const seller = await db('sellers').where({ webhook_secret: secret }).first();
    if (!seller) return reply.status(401).send({ error: 'Invalid webhook secret' });
    // Handled by main webhook route — this is just a convenience alias
    return reply.send({ received: true });
  });
};