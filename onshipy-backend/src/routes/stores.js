const db = require('../db/knex');

module.exports = async function(fastify) {

  const authenticate = async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  };

  // POST /api/stores/shopify/connect — verify Shopify credentials
  fastify.post('/shopify/connect', { preHandler: authenticate }, async (req, reply) => {
    const { shop_url, access_token } = req.body;
    if (!shop_url || !access_token) return reply.status(400).send({ error: 'shop_url and access_token required' });

    try {
      const cleanUrl = shop_url.replace('https://', '').replace('http://', '').replace('/', '');
      const res = await fetch(`https://${cleanUrl}/admin/api/2024-01/shop.json`, {
        headers: { 'X-Shopify-Access-Token': access_token }
      });
      if (!res.ok) return reply.status(401).send({ error: 'Invalid Shopify credentials. Check your store URL and access token.' });
      const data = await res.json();
      return reply.send({ success: true, shop_name: data.shop?.name, shop_url: cleanUrl, access_token, connected_at: new Date().toISOString() });
    } catch (err) {
      return reply.status(500).send({ error: 'Could not reach Shopify: ' + err.message });
    }
  });

  // POST /api/stores/shopify/push — push a listing to Shopify
  fastify.post('/shopify/push', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const { listing_id, shop_url, access_token } = req.body;

    if (!listing_id || !shop_url || !access_token) {
      return reply.status(400).send({ error: 'listing_id, shop_url and access_token required' });
    }

    try {
      // Get the listing with product data
      const listing = await db('product_listings')
        .join('imported_products', 'product_listings.imported_product_id', 'imported_products.id')
        .where({ 'product_listings.id': listing_id, 'product_listings.seller_id': seller_id })
        .select(
          'product_listings.*',
          'imported_products.title',
          'imported_products.description',
          'imported_products.images',
          'imported_products.source_url',
          'imported_products.currency',
          'imported_products.variants'
        )
        .first();

      if (!listing) return reply.status(404).send({ error: 'Listing not found' });

      const images = (() => {
        try {
          const imgs = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
          return (imgs || []).slice(0, 10).map(src => ({ src }));
        } catch { return []; }
      })();

      const cleanUrl = shop_url.replace('https://', '').replace('http://', '').replace('/', '');

      const shopifyProduct = {
        product: {
          title: listing.custom_title || listing.title,
          body_html: listing.description || '',
          vendor: 'Onshipy',
          product_type: 'Imported',
          tags: `onshipy,imported,${listing.source_domain || ''}`,
          images,
          variants: [{
            price: parseFloat(listing.selling_price).toFixed(2),
            compare_at_price: null,
            inventory_management: null,
            fulfillment_service: 'manual',
            requires_shipping: true,
          }],
          metafields: [{
            namespace: 'onshipy',
            key: 'source_url',
            value: listing.source_url || '',
            type: 'single_line_text_field'
          }]
        }
      };

      const res = await fetch(`https://${cleanUrl}/admin/api/2024-01/products.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': access_token
        },
        body: JSON.stringify(shopifyProduct)
      });

      const data = await res.json();

      if (!res.ok) {
        return reply.status(res.status).send({ error: data.errors ? JSON.stringify(data.errors) : 'Shopify push failed' });
      }

      const productUrl = `https://${cleanUrl}/products/${data.product?.handle}`;
      return reply.send({ success: true, shopify_product_id: data.product?.id, product_url: productUrl });

    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });
};