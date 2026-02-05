import Database from 'better-sqlite3';

let db;

export const initDatabase = () => {
  db = new Database('geminibot.db');

  db.exec(`
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

    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      chunk_text TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      embedding TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (document_id) REFERENCES knowledge_items(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback_logs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      message_text TEXT NOT NULL,
      feedback TEXT NOT NULL,
      user_query TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_knowledge_tenant ON knowledge_items(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);
    CREATE INDEX IF NOT EXISTS idx_chunks_tenant ON document_chunks(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_feedback_tenant ON feedback_logs(tenant_id);
  `);

  console.log('✅ Database initialized with RAG support');
};

export const getDb = () => db; // ✅ THÊM EXPORT NÀY

export { db }; // ✅ EXPORT LUÔN db