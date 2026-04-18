const db = require('../db/knex');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const querystring = require('querystring');

module.exports = async function(fastify, opts) {

  // POST /api/auth/register
  fastify.post('/register', async (req, reply) => {
    const { full_name, email, password, store_name } = req.body;
    if (!full_name || !email || !password) {
      return reply.status(400).send({ error: 'Name, email and password are required' });
    }
    if (password.length < 8) {
      return reply.status(400).send({ error: 'Password must be at least 8 characters' });
    }
    try {
      const existing = await db('sellers').where({ email }).first();
      if (existing) return reply.status(409).send({ error: 'Email already registered' });
      const password_hash = await bcrypt.hash(password, 12);
      const [seller] = await db('sellers').insert({
        full_name, email, password_hash,
        store_name: store_name || full_name + "'s Store",
        plan: 'free',
        webhook_secret: uuidv4()
      }).returning('*');
      const { password_hash: _, ...safe } = seller;
      const token = fastify.jwt.sign({ id: seller.id, email: seller.email });
      return reply.status(201).send({ token, seller: safe });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/auth/login
  fastify.post('/login', async (req, reply) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }
    try {
      const seller = await db('sellers').where({ email }).first();
      if (!seller) return reply.status(401).send({ error: 'Invalid email or password' });
      if (seller.password_hash === 'GOOGLE_AUTH') {
        return reply.status(401).send({ error: 'This account uses Google sign in.' });
      }
      const valid = await bcrypt.compare(password, seller.password_hash);
      if (!valid) return reply.status(401).send({ error: 'Invalid email or password' });
      const { password_hash, ...safe } = seller;
      const token = fastify.jwt.sign({ id: seller.id, email: seller.email });
      return reply.send({ token, seller: safe });
    } catch (err) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/auth/google — redirect to Google consent screen
  fastify.get('/google', async (req, reply) => {
    const params = querystring.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    });
    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  // GET /api/auth/google/callback
  fastify.get('/google/callback', async (req, reply) => {
    const { code, error } = req.query;

    if (error || !code) {
      return reply.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    }

    try {
      // Exchange code for tokens
      const tokenData = await new Promise((resolve, reject) => {
        const body = querystring.stringify({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
          grant_type: 'authorization_code'
        });

        const options = {
          hostname: 'oauth2.googleapis.com',
          path: '/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(body)
          }
        };

        const req2 = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); }
            catch { reject(new Error('Failed to parse token response')); }
          });
        });
        req2.on('error', reject);
        req2.write(body);
        req2.end();
      });

      if (!tokenData.access_token) {
        console.error('No access token:', tokenData);
        return reply.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
      }

      // Get user info from Google
      const googleUser = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'www.googleapis.com',
          path: '/oauth2/v2/userinfo',
          method: 'GET',
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        };
        const req3 = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); }
            catch { reject(new Error('Failed to parse user info')); }
          });
        });
        req3.on('error', reject);
        req3.end();
      });

      if (!googleUser.email) {
        return reply.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
      }

      // Find or create seller
      let seller = await db('sellers').where({ email: googleUser.email }).first();

      if (!seller) {
        const [newSeller] = await db('sellers').insert({
          full_name: googleUser.name || googleUser.email.split('@')[0],
          email: googleUser.email,
          password_hash: 'GOOGLE_AUTH',
          store_name: (googleUser.name || 'My') + "'s Store",
          plan: 'free',
          webhook_secret: uuidv4()
        }).returning('*');
        seller = newSeller;
      }

      const { password_hash, ...safe } = seller;
      const jwtToken = fastify.jwt.sign({ id: seller.id, email: seller.email });
      const sellerStr = encodeURIComponent(JSON.stringify(safe));

      return reply.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}&seller=${sellerStr}`
      );

    } catch (err) {
      console.error('Google OAuth error:', err.message);
      return reply.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    }
  });
};