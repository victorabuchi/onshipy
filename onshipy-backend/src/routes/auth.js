const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = async function(fastify) {

  fastify.post('/register', async (req, reply) => {
    const { full_name, email, password, store_name } = req.body;

    if (!full_name || !email || !password || !store_name) {
      return reply.status(400).send({ error: 'All fields are required' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const webhook_secret = require('crypto').randomBytes(32).toString('hex');
    const id = uuidv4();

    const token = fastify.jwt.sign(
      { id, email },
      { expiresIn: '7d' }
    );

    return reply.status(201).send({
      message: 'Account created successfully',
      token,
      seller: { id, full_name, email, store_name, plan: 'free', webhook_secret }
    });
  });

  fastify.post('/login', async (req, reply) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' });
    }
    return reply.send({ message: 'Login endpoint working' });
  });

};