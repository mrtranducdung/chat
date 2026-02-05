import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { db } from '../config/database.js';
import { cosineSimilarity } from '../utils/rags.js';
import { requireAuth } from '../middleware/auth.js';
import { Mistral } from '@mistralai/mistralai';
import { MISTRAL_API_KEY } from '../config/env.js'; // ✅ IMPORT TỪ ĐÂY

const router = Router();
const mistral = new Mistral({ apiKey: MISTRAL_API_KEY });

// ============================================
// GENERATE EMBEDDINGS
// ============================================

router.post('/', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!MISTRAL_API_KEY) {
      return res.status(503).json({ error: 'Embeddings service not configured' });
    }

    const embeddingResponse = await mistral.embeddings.create({
      model: 'mistral-embed',
      inputs: [text]
    });

    const embedding = embeddingResponse.data[0].embedding;

    res.json({ 
      embedding,
      dimensions: embedding.length
    });

  } catch (error) {
    console.error('Embeddings error:', error);
    res.status(500).json({ error: 'Failed to generate embeddings' });
  }
});

export default router;