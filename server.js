import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

// Initialize Gemini AI - FIXED: Use GEMINI_API_KEY (not VITE_ prefix)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
console.log('🤖 Gemini AI initialized:', !!GEMINI_API_KEY ? 'YES ✅' : 'NO ❌');

if (!GEMINI_API_KEY) {
  console.error('❌ WARNING: GEMINI_API_KEY not set in .env file! Chat will not work.');
  console.error('   Create a .env file in root directory with: GEMINI_API_KEY=your_key_here');
}

// Initialize SQLite database
const db = new Database('geminibot.db');

// ============================================
// DATABASE SCHEMA INITIALIZATION
// ============================================

db.exec(`
  -- Tenants table
  CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    monthly_message_limit INTEGER DEFAULT 1000,
    monthly_messages_used INTEGER DEFAULT 0,
    storage_limit_mb INTEGER DEFAULT 100,
    storage_used_mb REAL DEFAULT 0,
    created_at INTEGER NOT NULL,
    trial_ends_at INTEGER,
    subscription_ends_at INTEGER
  );

  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    email_verified INTEGER DEFAULT 0,
    last_login_at INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, email)
  );

  -- Chatbot configs table
  CREATE TABLE IF NOT EXISTS chatbot_configs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT UNIQUE NOT NULL,
    bot_name TEXT DEFAULT 'AI Assistant',
    welcome_message TEXT,
    system_prompt TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    theme TEXT DEFAULT 'light',
    enable_sound INTEGER DEFAULT 1,
    enable_feedback INTEGER DEFAULT 1,
    suggested_questions TEXT,
    default_language TEXT DEFAULT 'vi',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
  );

  -- Knowledge items table
  CREATE TABLE IF NOT EXISTS knowledge_items (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    file_name TEXT,
    file_size_bytes INTEGER,
    file_type TEXT,
    status TEXT DEFAULT 'active',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
  );

  -- Feedback logs table
  CREATE TABLE IF NOT EXISTS feedback_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    message_text TEXT NOT NULL,
    feedback TEXT NOT NULL,
    user_query TEXT,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_knowledge_tenant ON knowledge_items(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_feedback_tenant ON feedback_logs(tenant_id);
`);

console.log('✅ Database initialized');

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://192.168.1.110:3000',  // Add your local IP
    'http://192.168.1.110:5173'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Auth middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional auth middleware (allows both authenticated and public access)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
    } catch (error) {
      // Invalid token, but we allow request to continue
      console.warn('Invalid token in optional auth');
    }
  }
  next();
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// ============================================
// AUTH ROUTES
// ============================================

// Register new tenant
app.post('/api/auth/register', async (req, res) => {
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

    const insertTenant = db.prepare(`
      INSERT INTO tenants (id, name, slug, plan, status, created_at)
      VALUES (?, ?, ?, 'free', 'active', ?)
    `);

    const insertUser = db.prepare(`
      INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, created_at)
      VALUES (?, ?, ?, ?, ?, 'owner', ?)
    `);

    const insertConfig = db.prepare(`
      INSERT INTO chatbot_configs (id, tenant_id, bot_name, welcome_message, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertTenant.run(tenantId, tenantName, tenantSlug, now);
      insertUser.run(userId, tenantId, email, passwordHash, fullName, now);
      insertConfig.run(generateId(), tenantId, `${tenantName} Assistant`, 'Xin chào! Tôi có thể giúp gì cho bạn?', now, now);
    });

    transaction();

    const token = jwt.sign(
      { userId, tenantId, email, role: 'owner', plan: 'free' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: userId,
        email,
        fullName,
        role: 'owner'
      },
      tenant: {
        id: tenantId,
        name: tenantName,
        slug: tenantSlug,
        plan: 'free'
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
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
      { 
        userId: user.id, 
        tenantId: user.tenant_id, 
        email: user.email, 
        role: user.role, 
        plan: user.plan 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      tenant: {
        id: user.tenant_id,
        name: user.tenant_name,
        slug: user.tenant_slug,
        plan: user.plan
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================
// KNOWLEDGE BASE ROUTES
// ============================================

app.get('/api/knowledge', requireAuth, (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const items = db.prepare(`
      SELECT * FROM knowledge_items 
      WHERE tenant_id = ? AND status = 'active'
      ORDER BY created_at DESC
    `).all(tenantId);

    const formatted = items.map(item => ({
      id: item.id,
      tenantId: item.tenant_id,
      title: item.title,
      content: item.content,
      fileName: item.file_name,
      fileSizeBytes: item.file_size_bytes,
      fileType: item.file_type,
      status: item.status,
      dateAdded: item.created_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get knowledge error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge' });
  }
});

app.post('/api/knowledge', requireAuth, (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { title, content, fileName, fileType } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const id = generateId();
    const now = Date.now();
    const sizeBytes = Buffer.byteLength(content, 'utf8');

    db.prepare(`
      INSERT INTO knowledge_items 
      (id, tenant_id, title, content, file_name, file_size_bytes, file_type, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(id, tenantId, title, content, fileName, sizeBytes, fileType, now, now);

    const sizeMb = sizeBytes / (1024 * 1024);
    db.prepare('UPDATE tenants SET storage_used_mb = storage_used_mb + ? WHERE id = ?')
      .run(sizeMb, tenantId);

    const items = db.prepare('SELECT * FROM knowledge_items WHERE tenant_id = ? AND status = "active"')
      .all(tenantId);

    res.json(items.map(item => ({
      id: item.id,
      tenantId: item.tenant_id,
      title: item.title,
      content: item.content,
      fileName: item.file_name,
      dateAdded: item.created_at
    })));

  } catch (error) {
    console.error('Save knowledge error:', error);
    res.status(500).json({ error: 'Failed to save knowledge' });
  }
});

app.delete('/api/knowledge/:id', requireAuth, (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const item = db.prepare('SELECT file_size_bytes FROM knowledge_items WHERE id = ? AND tenant_id = ?')
      .get(id, tenantId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    db.prepare('DELETE FROM knowledge_items WHERE id = ? AND tenant_id = ?')
      .run(id, tenantId);

    const sizeMb = item.file_size_bytes / (1024 * 1024);
    db.prepare('UPDATE tenants SET storage_used_mb = storage_used_mb - ? WHERE id = ?')
      .run(sizeMb, tenantId);

    const items = db.prepare('SELECT * FROM knowledge_items WHERE tenant_id = ? AND status = "active"')
      .all(tenantId);

    res.json(items.map(i => ({
      id: i.id,
      tenantId: i.tenant_id,
      title: i.title,
      content: i.content,
      dateAdded: i.created_at
    })));

  } catch (error) {
    console.error('Delete knowledge error:', error);
    res.status(500).json({ error: 'Failed to delete knowledge' });
  }
});

// ============================================
// FEEDBACK ROUTES
// ============================================

app.get('/api/feedback', requireAuth, (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const logs = db.prepare(`
      SELECT * FROM feedback_logs 
      WHERE tenant_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 100
    `).all(tenantId);

    res.json(logs.map(log => ({
      id: log.id,
      tenantId: log.tenant_id,
      text: log.message_text,
      feedback: log.feedback,
      userQuery: log.user_query,
      timestamp: log.timestamp
    })));

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

app.post('/api/feedback', requireAuth, (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id, text, feedback, userQuery } = req.body;

    db.prepare(`
      INSERT OR REPLACE INTO feedback_logs 
      (id, tenant_id, message_text, feedback, user_query, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, tenantId, text, feedback, userQuery, Date.now());

    res.json({ success: true });

  } catch (error) {
    console.error('Save feedback error:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// ============================================
// CONFIG ROUTES
// ============================================

app.get('/api/config', requireAuth, (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const config = db.prepare('SELECT * FROM chatbot_configs WHERE tenant_id = ?').get(tenantId);
    
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }

    res.json({
      tenantId: config.tenant_id,
      botName: config.bot_name,
      welcomeMessage: config.welcome_message,
      systemPrompt: config.system_prompt,
      primaryColor: config.primary_color,
      theme: config.theme,
      enableSound: !!config.enable_sound,
      enableFeedback: !!config.enable_feedback,
      suggestedQuestions: config.suggested_questions ? JSON.parse(config.suggested_questions) : [],
      defaultLanguage: config.default_language
    });

  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

app.put('/api/config', requireAuth, (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const config = req.body;

    db.prepare(`
      UPDATE chatbot_configs 
      SET bot_name = ?, 
          welcome_message = ?, 
          system_prompt = ?,
          primary_color = ?,
          theme = ?,
          enable_sound = ?,
          enable_feedback = ?,
          suggested_questions = ?,
          default_language = ?,
          updated_at = ?
      WHERE tenant_id = ?
    `).run(
      config.botName,
      config.welcomeMessage,
      config.systemPrompt,
      config.primaryColor,
      config.theme,
      config.enableSound ? 1 : 0,
      config.enableFeedback ? 1 : 0,
      JSON.stringify(config.suggestedQuestions || []),
      config.defaultLanguage,
      Date.now(),
      tenantId
    );

    res.json({ success: true });

  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// ============================================
// TENANT INFO ROUTES
// ============================================

app.get('/api/tenant', requireAuth, (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      monthlyMessageLimit: tenant.monthly_message_limit,
      monthlyMessagesUsed: tenant.monthly_messages_used,
      storageLimitMb: tenant.storage_limit_mb,
      storageUsedMb: tenant.storage_used_mb,
      createdAt: tenant.created_at
    });

  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant info' });
  }
});

// ============================================
// CHAT ENDPOINT WITH REAL GEMINI AI
// ============================================

app.post('/api/chat', optionalAuth, async (req, res) => {
  try {
    const { message, history, botName, language, tenantId: bodyTenantId } = req.body;

    console.log('📨 Chat request received:', {
      message: message?.substring(0, 50),
      hasHistory: !!history,
      botName,
      language,
      tenantId: bodyTenantId || req.user?.tenantId
    });

    // Check if Gemini API is configured
    if (!GEMINI_API_KEY) {
      return res.status(503).json({ 
        error: 'AI service not configured. Please set GEMINI_API_KEY in .env file' 
      });
    }

    // Get tenant ID from auth or request body
    const tenantId = req.user?.tenantId || bodyTenantId || 'default';

    // Get knowledge base for this tenant (for RAG)
    const knowledge = db.prepare(
      "SELECT * FROM knowledge_items WHERE tenant_id = ? AND status = 'active' LIMIT 10"
    ).all(tenantId);

    console.log('📚 Knowledge items found:', knowledge.length);

    // Build context from knowledge base
    const contextText = knowledge
      .map(doc => `--- ${doc.title} ---\n${doc.content}`)
      .join('\n\n')
      .substring(0, 20000);

    // System instruction based on language
    const systemInstruction = language === 'vi'
      ? `Bạn là ${botName || 'trợ lý AI'}. Trả lời bằng tiếng Việt, ngắn gọn và chuyên nghiệp.

NGỮ CẢNH TÀI LIỆU:
${contextText || 'Không có tài liệu nào.'}

Nếu câu hỏi liên quan đến tài liệu trên, hãy sử dụng thông tin đó. Nếu không, trả lời dựa trên kiến thức chung.`
      : `You are ${botName || 'an AI assistant'}. Answer in English, concisely and professionally.

DOCUMENT CONTEXT:
${contextText || 'No documents available.'}

If the question relates to the documents above, use that information. Otherwise, answer based on general knowledge.`;

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Build conversation history for Gemini
    const contents = [
      ...history.filter(m => m.id !== 'welcome').map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    console.log('🤖 Calling Gemini API...');

    // Call Gemini API
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',  // ✅ This one is available
      systemInstruction 
    });

    const result = await model.generateContentStream({ contents });

    // Stream the response
    let totalChunks = 0;
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(text);
        totalChunks++;
      }
    }

    console.log('✅ Stream completed. Chunks sent:', totalChunks);
    res.end();

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    // Send error message if headers not sent yet
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to process message',
        details: error.message 
      });
    } else {
      // If streaming already started, just end the stream
      res.end();
    }
  }
});

app.post('/api/setup-test-account', async (req, res) => {
  try {
    const testEmail = 'admin@test.com';
    const testPassword = 'admin123';
    
    // Check if exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(testEmail);
    if (existing) {
      return res.json({ 
        message: 'Test account already exists',
        email: testEmail,
        password: testPassword 
      });
    }

    const tenantId = generateId();
    const userId = generateId();
    const passwordHash = await hashPassword(testPassword);
    const now = Date.now();

    // Create tenant
    db.prepare(`
      INSERT INTO tenants (id, name, slug, plan, status, created_at)
      VALUES (?, ?, ?, 'free', 'active', ?)
    `).run(tenantId, 'Test Company', 'test-company', now);

    // Create user
    db.prepare(`
      INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, created_at)
      VALUES (?, ?, ?, ?, ?, 'owner', ?)
    `).run(userId, tenantId, testEmail, passwordHash, 'Admin User', now);

    // Create config
    db.prepare(`
      INSERT INTO chatbot_configs (id, tenant_id, bot_name, welcome_message, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(generateId(), tenantId, 'GeminiBot', 'Xin chào! Tôi có thể giúp gì cho bạn?', now, now);

    res.json({ 
      success: true,
      message: 'Test account created successfully!',
      credentials: {
        email: testEmail,
        password: testPassword
      },
      tenantId: tenantId
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    geminiConfigured: !!GEMINI_API_KEY,
    timestamp: Date.now()
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 GeminiBot Multi-Tenant API running on http://localhost:${PORT}`);
  console.log(`📊 Database: geminibot.db`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET === 'change-me-in-production' ? '⚠️  CHANGE IN PRODUCTION!' : '✓ Custom'}`);
  console.log(`🤖 Gemini API: ${GEMINI_API_KEY ? '✅ Configured' : '❌ NOT CONFIGURED'}`);
});