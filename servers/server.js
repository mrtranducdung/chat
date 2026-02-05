import './config/env.js'; // ✅ IMPORT ĐẦU TIÊN
import express from 'express';
import { initDatabase, db } from './config/database.js';
import { corsMiddleware } from './middleware/cors.js';
import authRoutes from './routes/auth.js';
import knowledgeRoutes from './routes/knowledge.js';
import chatRoutes from './routes/chat.js';
import configRoutes from './routes/config.js';
import feedbackRoutes from './routes/feedback.js';
import tenantRoutes from './routes/tenant.js';
import embeddingsRoutes from './routes/embeddings.js';
import { PORT, MISTRAL_API_KEY } from './config/env.js';

const app = express();

// Initialize database
initDatabase();

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/config', configRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/embeddings', embeddingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const chunkCount = db.prepare('SELECT COUNT(*) as count FROM document_chunks').get().count;
  res.json({ 
    status: 'ok', 
    mistralConfigured: !!MISTRAL_API_KEY, 
    ragEnabled: chunkCount > 0,
    totalChunks: chunkCount,
    timestamp: Date.now() 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Mistral: ${MISTRAL_API_KEY ? '✅' : '❌'}`);
  console.log(`🧠 RAG: ${MISTRAL_API_KEY ? '✅ Ready' : '❌ Disabled'}`);
});