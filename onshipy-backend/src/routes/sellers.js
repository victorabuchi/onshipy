const db = require('../db/knex');
const bcrypt = require('bcryptjs');

module.exports = async function(fastify) {

  const authenticate = async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  };

  fastify.get('/me', { preHandler: authenticate }, async (req, reply) => {
    const { id } = req.user;
    try {
      const seller = await db('sellers').where({ id }).first();
      if (!seller) return reply.status(404).send({ error: 'Not found' });
      const { password_hash, ...safe } = seller;
      return reply.send({ seller: safe });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  fastify.patch('/profile', { preHandler: authenticate }, async (req, reply) => {
    const { id } = req.user;
    const { full_name, email, store_name, store_url } = req.body;
    try {
      await db('sellers').where({ id }).update({
        ...(full_name !== undefined && { full_name }),
        ...(email !== undefined && { email }),
        ...(store_name !== undefined && { store_name }),
        ...(store_url !== undefined && { store_url: store_url || null }),
      });
      const seller = await db('sellers').where({ id }).first();
      const { password_hash, ...safe } = seller;
      return reply.send({ seller: safe, message: 'Saved' });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  fastify.patch('/password', { preHandler: authenticate }, async (req, reply) => {
    const { id } = req.user;
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return reply.status(400).send({ error: 'Both passwords required' });
    if (new_password.length < 8) return reply.status(400).send({ error: 'Min 8 characters' });
    try {
      const seller = await db('sellers').where({ id }).first();
      const valid = await bcrypt.compare(current_password, seller.password_hash);
      if (!valid) return reply.status(401).send({ error: 'Current password incorrect' });
      const password_hash = await bcrypt.hash(new_password, 12);
      await db('sellers').where({ id }).update({ password_hash });
      return reply.send({ message: 'Password updated' });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });
};