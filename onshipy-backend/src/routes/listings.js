const db = require('../db/knex');

module.exports = async function(fastify) {

  const authenticate = async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  };

  // GET /api/listings
  fastify.get('/', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const listings = await db('product_listings')
      .join('imported_products', 'product_listings.imported_product_id', 'imported_products.id')
      .where('product_listings.seller_id', seller_id)
      .select(
        'product_listings.*',
        'imported_products.source_url',
        'imported_products.source_domain',
        'imported_products.images',
        'imported_products.currency',
        'imported_products.title as original_title'
      )
      .orderBy('product_listings.created_at', 'desc');
    return reply.send({ listings });
  });

  // DELETE /api/listings/:id
  fastify.delete('/:id', { preHandler: authenticate }, async (req, reply) => {
    const seller_id = req.user.id;
    const { id } = req.params;
    try {
      const deleted = await db('product_listings')
        .where({ id, seller_id })
        .delete();
      if (!deleted) return reply.status(404).send({ error: 'Listing not found' });
      return reply.send({ success: true });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });
};