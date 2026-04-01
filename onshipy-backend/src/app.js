require('dotenv').config();
const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/cors'), {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
fastify.register(require('@fastify/helmet'), { contentSecurityPolicy: false });
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'onshipy_dev_secret'
});

fastify.register(require('./routes/auth'),     { prefix: '/api/auth' });
fastify.register(require('./routes/products'), { prefix: '/api/products' });
fastify.register(require('./routes/listings'), { prefix: '/api/listings' });
fastify.register(require('./routes/sellers'),  { prefix: '/api/sellers' });
fastify.register(require('./routes/orders'),   { prefix: '/api/orders' });
fastify.register(require('./routes/webhook'),  { prefix: '/api/webhook' });

fastify.get('/health', async () => ({
  status: 'ok', app: 'Onshipy', version: '1.0.0'
}));

fastify.setErrorHandler((error, req, reply) => {
  console.error('Unhandled error:', error);
  reply.status(500).send({ error: error.message });
});

const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3000,
      host: '0.0.0.0'
    });
    console.log('Onshipy backend running');
    const { processAutoBuyJobs } = require('./workers/autoBuyWorker');
    setInterval(processAutoBuyJobs, 30000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();