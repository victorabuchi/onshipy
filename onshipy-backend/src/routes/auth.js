require('dotenv').config();
const db = require('../db/knex');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const querystring = require('querystring');

module.exports = async function authRoutes(fastify, opts) {

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
        full_name,
        email,
        password_hash,
        store_name: store_name || full_name + "'s Store",
        plan: 'free',
        webhook_secret: uuidv4()
      }).returning('*');

      const { password_hash: _, ...safe } = seller;
      const token = fastify.jwt.sign({ id: seller.id, email: seller.email });
      return reply.status(201).send({ token, seller: safe });
    } catch (err) {
      console.error('Register error:', err.message);
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
        return reply.status(401).send({ error: 'This account was created with Google. Please use Continue with Google.' });
      }

      const valid = await bcrypt.compare(password, seller.password_hash);
      if (!valid) return reply.status(401).send({ error: 'Invalid email or password' });

      const { password_hash, ...safe } = seller;
      const token = fastify.jwt.sign({ id: seller.id, email: seller.email });
      return reply.send({ token, seller: safe });
    } catch (err) {
      console.error('Login error:', err.message);
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/auth/google — redirect to Google
  fastify.get('/google', async (req, reply) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const backendUrl = process.env.BACKEND_URL;

    if (!clientId || !backendUrl) {
      return reply.status(500).send({
        error: 'Google OAuth not configured. Missing GOOGLE_CLIENT_ID or BACKEND_URL env vars.'
      });
    }

    const params = querystring.stringify({
      client_id: clientId,
      redirect_uri: `${backendUrl}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    });

    return reply.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    );
  });

  // GET /api/auth/google/callback
  fastify.get('/google/callback', async (req, reply) => {
    const { code, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL;
    const backendUrl = process.env.BACKEND_URL;

    if (error || !code) {
      console.error('Google OAuth denied or no code:', error);
      return reply.redirect(`${frontendUrl}/login?error=google_failed`);
    }

    try {
      // Exchange code for tokens
      const tokenData = await new Promise((resolve, reject) => {
        const body = querystring.stringify({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${backendUrl}/api/auth/google/callback`,
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

        const r = https.request(options, (res) => {
          let d = '';
          res.on('data', chunk => d += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(d)); }
            catch (e) { reject(new Error('Failed to parse Google token response')); }
          });
        });
        r.on('error', reject);
        r.write(body);
        r.end();
      });

      if (!tokenData.access_token) {
        console.error('No access token from Google:', JSON.stringify(tokenData));
        return reply.redirect(`${frontendUrl}/login?error=google_failed`);
      }

      // Get user info
      const googleUser = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'www.googleapis.com',
          path: '/oauth2/v2/userinfo',
          method: 'GET',
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        };
        const r = https.request(options, (res) => {
          let d = '';
          res.on('data', chunk => d += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(d)); }
            catch (e) { reject(new Error('Failed to parse Google user info')); }
          });
        });
        r.on('error', reject);
        r.end();
      });

      if (!googleUser.email) {
        console.error('No email from Google:', JSON.stringify(googleUser));
        return reply.redirect(`${frontendUrl}/login?error=google_failed`);
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
        `${frontendUrl}/auth/callback?token=${jwtToken}&seller=${sellerStr}`
      );

    } catch (err) {
      console.error('Google callback error:', err.message);
      return reply.redirect(`${frontendUrl}/login?error=google_failed`);
    }
  });
};