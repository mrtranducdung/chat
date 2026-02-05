import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { generateId, hashPassword, verifyPassword } from '../utils/helpers.js';
import { JWT_SECRET } from '../config/env.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { tenantName, tenantSlug, email, password, fullName } = req.body;

    if (!tenantName || !tenantSlug || !email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingTenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(tenantSlug);
    if (existingTenant) {
      return res.status(400).json({ error: 'Tenant slug already taken' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const tenantId = generateId();
    const userId = generateId();
    const passwordHash = await hashPassword(password);
    const now = Date.now();

    const transaction = db.transaction(() => {
      db.prepare(`INSERT INTO tenants (id, name, slug, plan, status, created_at) 
        VALUES (?, ?, ?, 'free', 'active', ?)`)
        .run(tenantId, tenantName, tenantSlug, now);
      
      db.prepare(`INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, created_at) 
        VALUES (?, ?, ?, ?, ?, 'owner', ?)`)
        .run(userId, tenantId, email, passwordHash, fullName, now);
      
      db.prepare(`INSERT INTO chatbot_configs (id, tenant_id, bot_name, welcome_message, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?)`)
        .run(generateId(), tenantId, `${tenantName} Assistant`, 'Xin chào! Tôi có thể giúp gì cho bạn?', now, now);
    });

    transaction();

    const token = jwt.sign(
      { userId, tenantId, email, role: 'owner', plan: 'free' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: userId, email, fullName, role: 'owner' },
      tenant: { id: tenantId, name: tenantName, slug: tenantSlug, plan: 'free' }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare(`
      SELECT u.*, t.plan, t.status as tenant_status, t.slug as tenant_slug, t.name as tenant_name
      FROM users u
      JOIN tenants t ON t.id = u.tenant_id
      WHERE u.email = ?
    `).get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.tenant_status !== 'active') {
      return res.status(403).json({ error: 'Account suspended' });
    }

    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(Date.now(), user.id);

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, email: user.email, role: user.role, plan: user.plan },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
      tenant: { id: user.tenant_id, name: user.tenant_name, slug: user.tenant_slug, plan: user.plan }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;