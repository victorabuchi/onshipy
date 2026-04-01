const db = require('../db/knex');

module.exports = async function(fastify) {

  const authenticate = async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  };

  // GET /api/orders
  fastify.get('/', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    try {
      const orders = await db('customer_orders')
        .where({ seller_id })
        .orderBy('created_at', 'desc');
      return reply.send({ orders });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/orders/:id
  fastify.get('/:id', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const { id } = req.params;
    try {
      const order = await db('customer_orders')
        .where({ id, seller_id }).first();
      if (!order) return reply.status(404).send({ error: 'Not found' });
      return reply.send({ order });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/orders/:id/status — get auto-buy job status for an order
  fastify.get('/:id/status', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const { id } = req.params;
    try {
      const order = await db('customer_orders')
        .where({ id, seller_id }).first();
      if (!order) return reply.status(404).send({ error: 'Not found' });

      const job = await db('auto_buy_jobs')
        .where({ customer_order_id: id })
        .orderBy('created_at', 'desc')
        .first();

      const shipment = job ? await db('shipments')
        .where({ auto_buy_job_id: job.id }).first() : null;

      return reply.send({ order, job, shipment });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // PATCH /api/orders/:id/status — manually update order status
  fastify.patch('/:id/status', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return reply.status(400).send({ error: 'Invalid status' });
    }

    try {
      const [updated] = await db('customer_orders')
        .where({ id, seller_id })
        .update({ status })
        .returning('*');
      if (!updated) return reply.status(404).send({ error: 'Order not found' });
      return reply.send({ order: updated });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });
};