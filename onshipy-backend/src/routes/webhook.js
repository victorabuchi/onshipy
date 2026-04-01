const db = require('../db/knex');
const crypto = require('crypto');

module.exports = async function(fastify) {

  // POST /api/webhook/:secret — receives orders from connected stores
  fastify.post('/:secret', async (req, reply) => {
    const { secret } = req.params;
    const payload = req.body;

    try {
      // Find seller by webhook secret
      const seller = await db('sellers').where({ webhook_secret: secret }).first();
      if (!seller) return reply.status(401).send({ error: 'Invalid webhook secret' });

      // Log the webhook event
      await db('webhook_events').insert({
        seller_id: seller.id,
        source: payload.source || 'webhook',
        event_type: payload.event_type || 'order.created',
        status: 'pending',
        payload: JSON.stringify(payload)
      });

      // Process order if it's a new order
      if (payload.event_type === 'order.created' || payload.order) {
        const order = payload.order || payload;

        // Find the product listing
        const listing = await db('product_listings')
          .join('imported_products', 'product_listings.imported_product_id', 'imported_products.id')
          .where({ 'product_listings.seller_id': seller.id })
          .where('imported_products.source_url', order.product_url)
          .select('product_listings.*', 'imported_products.source_url', 'imported_products.source_domain')
          .first();

        // Save customer order
        const [customerOrder] = await db('customer_orders').insert({
          seller_id: seller.id,
          product_listing_id: listing?.id || null,
          storefront_order_id: order.id || order.order_id,
          customer_name: order.customer?.name || order.customer_name,
          customer_email: order.customer?.email || order.customer_email,
          shipping_address: JSON.stringify(order.shipping_address || order.customer?.address || {}),
          selected_variant: order.variant || order.selected_variant || null,
          quantity: order.quantity || 1,
          amount_paid: order.total || order.amount_paid || 0,
          currency: order.currency || 'USD',
          status: 'pending'
        }).returning('*');

        // Trigger auto-buy job
        if (listing) {
          await db('auto_buy_jobs').insert({
            customer_order_id: customerOrder.id,
            source_url: listing.source_url,
            source_domain: listing.source_domain,
            source_order_id: null,
            status: 'pending',
            retry_count: 0,
            attempted_at: new Date()
          });
        }
      }

      return reply.send({ received: true });
    } catch (err) {
      console.error('Webhook error:', err.message);
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/webhook/tracking — receives tracking from supplier
  fastify.post('/tracking/:secret', async (req, reply) => {
    const { secret } = req.params;
    const { order_id, tracking_number, carrier, tracking_url } = req.body;

    try {
      const seller = await db('sellers').where({ webhook_secret: secret }).first();
      if (!seller) return reply.status(401).send({ error: 'Invalid secret' });

      // Find the auto buy job
      const job = await db('auto_buy_jobs')
        .join('customer_orders', 'auto_buy_jobs.customer_order_id', 'customer_orders.id')
        .where('customer_orders.storefront_order_id', order_id)
        .where('customer_orders.seller_id', seller.id)
        .select('auto_buy_jobs.*')
        .first();

      if (job) {
        // Save shipment
        await db('shipments').insert({
          auto_buy_job_id: job.id,
          tracking_number,
          carrier,
          tracking_url,
          mirror_status: 'pending',
          shipped_at: new Date()
        });

        // Update order status
        await db('customer_orders')
          .where({ id: job.customer_order_id })
          .update({ status: 'shipped' });

        // Update auto buy job
        await db('auto_buy_jobs')
          .where({ id: job.id })
          .update({ status: 'shipped' });
      }

      return reply.send({ received: true });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });
};