import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';
import { db } from '../config/database.js';
import { chunkText, cosineSimilarity } from '../utils/rags.js';
import { Mistral } from '@mistralai/mistralai';
import { MISTRAL_API_KEY } from '../config/env.js';

const router = Router();
const mistral = new Mistral({ apiKey: MISTRAL_API_KEY });

// ============================================
// GET ALL KNOWLEDGE ITEMS
// ============================================

router.get('/', requireAuth, (req, res) => {
  try {
    const items = db.prepare(`
      SELECT k.*, COUNT(c.id) as chunk_count 
      FROM knowledge_items k
      LEFT JOIN document_chunks c ON c.document_id = k.id
      WHERE k.tenant_id = ?
      GROUP BY k.id
      ORDER BY k.created_at DESC
    `).all(req.user.tenantId);
    
    res.json(items.map(item => ({
      id: item.id, 
      tenantId: item.tenant_id, 
      title: item.title, 
      content: item.content,
      fileName: item.file_name, 
      fileSizeBytes: item.file_size_bytes, 
      fileType: item.file_type,
      status: item.status || 'active',
      dateAdded: item.created_at,
      chunkCount: item.chunk_count
    })));
  } catch (error) {
    console.error('Get knowledge error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge' });
  }
});

// ============================================
// ADD KNOWLEDGE ITEM WITH RAG
// ============================================

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, fileName, fileType } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    if (!MISTRAL_API_KEY) {
      return res.status(503).json({ error: 'RAG service not configured - MISTRAL_API_KEY missing' });
    }

    const id = generateId();
    const now = Date.now();
    const sizeBytes = Buffer.byteLength(content, 'utf8');

    console.log(`📄 Processing document: ${title}`);

    // 1. Save document metadata
    db.prepare(`
      INSERT INTO knowledge_items (id, tenant_id, title, content, file_name, file_size_bytes, file_type, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.tenantId, title, content, fileName, sizeBytes, fileType, now, now);

    // 2. Chunk the content (smaller chunks for better granularity)
    const chunks = chunkText(content, 200); // ✅ Reduced from 500 to 200 words
    console.log(`✂️  Created ${chunks.length} chunks`);

    // 3. Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunkTextContent = chunks[i];
      
      try {
        const embeddingResponse = await mistral.embeddings.create({
          model: 'mistral-embed',
          inputs: [chunkTextContent]
        });
        
        const embedding = embeddingResponse.data[0].embedding;
        const embeddingJson = JSON.stringify(embedding);
        
        const chunkId = generateId();
        db.prepare(`
          INSERT INTO document_chunks (id, document_id, tenant_id, chunk_text, chunk_index, embedding, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(chunkId, id, req.user.tenantId, chunkTextContent, i, embeddingJson, now);
        
        console.log(`✅ Chunk ${i + 1}/${chunks.length} embedded (${embedding.length} dimensions)`);
      } catch (embError) {
        console.error(`❌ Failed to embed chunk ${i + 1}:`, embError);
      }
    }

    // 4. Update storage usage
    db.prepare('UPDATE tenants SET storage_used_mb = storage_used_mb + ? WHERE id = ?')
      .run(sizeBytes / (1024 * 1024), req.user.tenantId);

    // 5. Return all items
    const items = db.prepare(`
      SELECT k.*, COUNT(c.id) as chunk_count 
      FROM knowledge_items k
      LEFT JOIN document_chunks c ON c.document_id = k.id
      WHERE k.tenant_id = ?
      GROUP BY k.id
      ORDER BY k.created_at DESC
    `).all(req.user.tenantId);
    
    res.json(items.map(i => ({ 
      id: i.id, 
      tenantId: i.tenant_id, 
      title: i.title, 
      content: i.content, 
      fileName: i.file_name, 
      dateAdded: i.created_at,
      chunkCount: i.chunk_count,
      status: i.status || 'active'
    })));
    
  } catch (error) {
    console.error('Save knowledge error:', error);
    res.status(500).json({ error: 'Failed to save knowledge', details: error.message });
  }
});

// ============================================
// DELETE KNOWLEDGE ITEM
// ============================================

router.delete('/:id', requireAuth, (req, res) => {
  try {
    const item = db.prepare('SELECT file_size_bytes FROM knowledge_items WHERE id = ? AND tenant_id = ?')
      .get(req.params.id, req.user.tenantId);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete chunks first
    db.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(req.params.id);
    
    // Delete document
    db.prepare('DELETE FROM knowledge_items WHERE id = ? AND tenant_id = ?')
      .run(req.params.id, req.user.tenantId);
    
    // Update storage
    db.prepare('UPDATE tenants SET storage_used_mb = storage_used_mb - ? WHERE id = ?')
      .run(item.file_size_bytes / (1024 * 1024), req.user.tenantId);

    // Return remaining items
    const items = db.prepare(`
      SELECT k.*, COUNT(c.id) as chunk_count 
      FROM knowledge_items k
      LEFT JOIN document_chunks c ON c.document_id = k.id
      WHERE k.tenant_id = ?
      GROUP BY k.id
      ORDER BY k.created_at DESC
    `).all(req.user.tenantId);
    
    res.json(items.map(i => ({ 
      id: i.id, 
      tenantId: i.tenant_id, 
      title: i.title, 
      content: i.content, 
      dateAdded: i.created_at,
      chunkCount: i.chunk_count,
      status: i.status || 'active'
    })));
  } catch (error) {
    console.error('Delete knowledge error:', error);
    res.status(500).json({ error: 'Failed to delete knowledge' });
  }
});

// ============================================
// RAG SEARCH (For Testing)
// ============================================

router.post('/search', requireAuth, async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!MISTRAL_API_KEY) {
      return res.status(503).json({ error: 'RAG search not configured' });
    }

    console.log(`🔍 RAG Search: "${query}"`);

    // 1. Generate embedding for query
    const queryEmbeddingResponse = await mistral.embeddings.create({
      model: 'mistral-embed',
      inputs: [query]
    });
    const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

    // 2. Get all chunks for tenant
    const chunks = db.prepare(`
      SELECT id, document_id, chunk_text, chunk_index, embedding 
      FROM document_chunks 
      WHERE tenant_id = ?
    `).all(req.user.tenantId);

    if (chunks.length === 0) {
      return res.json({ results: [] });
    }

    console.log(`📊 Searching ${chunks.length} chunks...`);

    // 3. Calculate similarity for each chunk
    const results = chunks.map(chunk => {
      const chunkEmbedding = JSON.parse(chunk.embedding);
      const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
      
      return {
        id: chunk.id,
        documentId: chunk.document_id,
        text: chunk.chunk_text,
        chunkIndex: chunk.chunk_index,
        similarity: similarity
      };
    });

    // 4. Sort by similarity and get top N
    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, limit);

    console.log(`✅ Top ${topResults.length} results (similarity: ${topResults[0]?.similarity.toFixed(3)} - ${topResults[topResults.length-1]?.similarity.toFixed(3)})`);

    res.json({ results: topResults });

  } catch (error) {
    console.error('RAG search error:', error);
    res.status(500).json({ error: 'RAG search failed', details: error.message });
  }
});

// ============================================
// GET KNOWLEDGE STATS (For Widget Header)
// ============================================

router.get('/stats', optionalAuth, (req, res) => {
  try {
    // ✅ Get tenantId from JWT (admin) or query param (embedded)
    const tenantId = req.user?.tenantId || req.query.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId required' });
    }

    const stats = db.prepare(`
      SELECT 
        COUNT(DISTINCT k.id) as total_documents,
        COUNT(c.id) as total_chunks,
        SUM(k.file_size_bytes) as total_bytes
      FROM knowledge_items k
      LEFT JOIN document_chunks c ON c.document_id = k.id
      WHERE k.tenant_id = ?
    `).get(tenantId);

    res.json({
      totalDocuments: stats.total_documents || 0,
      totalChunks: stats.total_chunks || 0,
      storageUsedMb: (stats.total_bytes || 0) / (1024 * 1024),
      hasDocuments: (stats.total_documents || 0) > 0
    });
  } catch (error) {
    console.error('Get knowledge stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;