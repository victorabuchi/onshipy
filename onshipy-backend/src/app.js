require('dotenv').config();
const fastify = require('fastify')({
  logger: true,
  // needed for Stripe webhook raw body verification
  bodyLimit: 10485760
});

// Raw body for Stripe webhooks
fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (req, body, done) {
  req.rawBody = body;
  try { done(null, JSON.parse(body)); }
  catch (err) { err.statusCode = 400; done(err, undefined); }
});

fastify.register(require('@fastify/cors'), {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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
fastify.register(require('./routes/stores'),   { prefix: '/api/stores' });
fastify.register(require('./routes/billing'),  { prefix: '/api/billing' });

fastify.get('/health', async () => ({
  status: 'ok',
  app: 'Onshipy',
  version: '1.0.0',
  env_check: {
    google_client_id: !!process.env.GOOGLE_CLIENT_ID,
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
    backend_url: process.env.BACKEND_URL || 'NOT SET',
    frontend_url: process.env.FRONTEND_URL || 'NOT SET'
  }
}));

fastify.setErrorHandler((error, req, reply) => {
  console.error('Error:', error.message);
  reply.status(error.statusCode || 500).send({ error: error.message });
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    console.log('Onshipy backend running');
    const { processAutoBuyJobs } = require('./workers/autoBuyWorker');
    setInterval(processAutoBuyJobs, 30000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();