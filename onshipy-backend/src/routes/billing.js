require('dotenv').config();
const Stripe = require('stripe');
const db = require('../db/knex');

module.exports = async function billingRoutes(fastify) {

  const authenticate = async (req, reply) => {
    try { await req.jwtVerify(); }
    catch { return reply.status(401).send({ error: 'Unauthorized' }); }
  };

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  // POST /api/billing/checkout — create checkout session
  fastify.post('/checkout', { preHandler: authenticate }, async (req, reply) => {
    const { plan } = req.body; // 'pro' or 'enterprise'
    const sellerId = req.user.id;

    const priceId = plan === 'pro'
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_ENTERPRISE_PRICE_ID;

    if (!priceId) return reply.status(400).send({ error: 'Invalid plan' });

    try {
      const seller = await db('sellers').where({ id: sellerId }).first();

      // Create or reuse Stripe customer
      let customerId = seller.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: seller.email,
          name: seller.full_name,
          metadata: { seller_id: sellerId }
        });
        customerId = customer.id;
        await db('sellers').where({ id: sellerId }).update({ stripe_customer_id: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/settings?section=plans`,
        metadata: { seller_id: sellerId, plan }
      });

      return reply.send({ url: session.url });
    } catch (err) {
      console.error('Checkout error:', err.message);
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/billing/portal — customer portal for managing subscription
  fastify.post('/portal', { preHandler: authenticate }, async (req, reply) => {
    const sellerId = req.user.id;
    try {
      const seller = await db('sellers').where({ id: sellerId }).first();
      if (!seller.stripe_customer_id) {
        return reply.status(400).send({ error: 'No active subscription' });
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: seller.stripe_customer_id,
        return_url: `${process.env.FRONTEND_URL}/settings?section=billing`
      });
      return reply.send({ url: session.url });
    } catch (err) {
      console.error('Portal error:', err.message);
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/billing/status — get current subscription status
  fastify.get('/status', { preHandler: authenticate }, async (req, reply) => {
    const sellerId = req.user.id;
    try {
      const seller = await db('sellers').where({ id: sellerId }).first();
      return reply.send({
        plan: seller.plan || 'free',
        stripe_customer_id: seller.stripe_customer_id || null,
        stripe_subscription_id: seller.stripe_subscription_id || null,
        subscription_status: seller.subscription_status || null,
        subscription_end: seller.subscription_current_period_end || null
      });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/billing/webhook — Stripe webhook (raw body needed)
  fastify.post('/webhook', {
    config: { rawBody: true }
  }, async (req, reply) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature failed:', err.message);
      return reply.status(400).send({ error: `Webhook Error: ${err.message}` });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const sellerId = session.metadata?.seller_id;
          const plan = session.metadata?.plan;
          if (sellerId && plan) {
            await db('sellers').where({ id: sellerId }).update({
              plan,
              stripe_subscription_id: session.subscription,
              subscription_status: 'active'
            });
            console.log(`✓ Seller ${sellerId} upgraded to ${plan}`);
          }
          break;
        }
        case 'customer.subscription.updated': {
          const sub = event.data.object;
          const customer = await stripe.customers.retrieve(sub.customer);
          const sellerId = customer.metadata?.seller_id;
          if (sellerId) {
            const plan = sub.items.data[0]?.price?.id === process.env.STRIPE_PRO_PRICE_ID ? 'pro'
              : sub.items.data[0]?.price?.id === process.env.STRIPE_ENTERPRISE_PRICE_ID ? 'enterprise'
              : 'free';
            await db('sellers').where({ id: sellerId }).update({
              plan: sub.status === 'active' ? plan : 'free',
              subscription_status: sub.status,
              subscription_current_period_end: new Date(sub.current_period_end * 1000)
            });
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object;
          const customer = await stripe.customers.retrieve(sub.customer);
          const sellerId = customer.metadata?.seller_id;
          if (sellerId) {
            await db('sellers').where({ id: sellerId }).update({
              plan: 'free',
              stripe_subscription_id: null,
              subscription_status: 'canceled'
            });
            console.log(`✓ Seller ${sellerId} downgraded to free`);
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          const customer = await stripe.customers.retrieve(invoice.customer);
          const sellerId = customer.metadata?.seller_id;
          if (sellerId) {
            await db('sellers').where({ id: sellerId }).update({
              subscription_status: 'past_due'
            });
          }
          break;
        }
      }
    } catch (err) {
      console.error('Webhook handler error:', err.message);
    }

    return reply.send({ received: true });
  });
};