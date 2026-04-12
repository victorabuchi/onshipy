const db = require('../db/knex');
const https = require('https');

module.exports = async function(fastify) {

  const authenticate = async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  };

  // Helper — make HTTPS request without fetch
  const httpsRequest = (options, body = null) => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  // POST /api/stores/shopify/connect
  fastify.post('/shopify/connect', { preHandler: authenticate }, async (req, reply) => {
    const { shop_url, access_token } = req.body;
    if (!shop_url || !access_token) {
      return reply.status(400).send({ error: 'shop_url and access_token required' });
    }

    try {
      const cleanUrl = shop_url
        .replace('https://', '')
        .replace('http://', '')
        .replace(/\/$/, '')
        .trim();

      const result = await httpsRequest({
        hostname: cleanUrl,
        path: '/admin/api/2024-01/shop.json',
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json'
        }
      });

      if (result.status !== 200) {
        return reply.status(401).send({
          error: `Shopify returned ${result.status}. Check your store URL and access token. Make sure your Shopify app has read/write Products scope.`
        });
      }

      return reply.send({
        success: true,
        shop_name: result.body.shop?.name,
        shop_url: cleanUrl,
        access_token,
        connected_at: new Date().toISOString()
      });

    } catch (err) {
      return reply.status(500).send({
        error: 'Could not reach Shopify: ' + err.message + '. Make sure your store URL is correct (e.g. your-store.myshopify.com)'
      });
    }
  });

  // POST /api/stores/shopify/push
  fastify.post('/shopify/push', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const { listing_id, shop_url, access_token } = req.body;

    if (!listing_id || !shop_url || !access_token) {
      return reply.status(400).send({ error: 'listing_id, shop_url and access_token required' });
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
          'imported_products.source_url',
          'imported_products.source_domain',
          'imported_products.currency'
        )
        .first();

      if (!listing) return reply.status(404).send({ error: 'Listing not found' });

      const images = (() => {
        try {
          const imgs = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
          return (imgs || []).slice(0, 5).map(src => ({ src }));
        } catch { return []; }
      })();

      const cleanUrl = shop_url
        .replace('https://', '')
        .replace('http://', '')
        .replace(/\/$/, '')
        .trim();

      const productBody = {
        product: {
          title: listing.custom_title || listing.title,
          body_html: `<p>${listing.description || ''}</p><p><small>Source: ${listing.source_url}</small></p>`,
          vendor: 'Onshipy',
          product_type: 'Dropship',
          tags: `onshipy,dropship,${listing.source_domain || ''}`,
          images,
          variants: [{
            price: parseFloat(listing.selling_price).toFixed(2),
            inventory_management: null,
            fulfillment_service: 'manual',
            requires_shipping: true,
            taxable: true
          }]
        }
      };

      const bodyStr = JSON.stringify(productBody);

      const result = await httpsRequest({
        hostname: cleanUrl,
        path: '/admin/api/2024-01/products.json',
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr)
        }
      }, productBody);

      if (result.status !== 201 && result.status !== 200) {
        return reply.status(result.status).send({
          error: result.body?.errors
            ? JSON.stringify(result.body.errors)
            : `Shopify returned ${result.status}`
        });
      }

      const handle = result.body.product?.handle;
      const productUrl = `https://${cleanUrl}/products/${handle}`;

      return reply.send({
        success: true,
        shopify_product_id: result.body.product?.id,
        product_url: productUrl,
        handle
      });

    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });
};