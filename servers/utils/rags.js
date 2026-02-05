import { Mistral } from '@mistralai/mistralai';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
export const mistral = new Mistral({ apiKey: MISTRAL_API_KEY });

console.log('🤖 Mistral AI initialized:', !!MISTRAL_API_KEY ? 'YES ✅' : 'NO ❌');

if (!MISTRAL_API_KEY) {
  console.error('❌ WARNING: MISTRAL_API_KEY not set! Chat will not work.');
}

// Chunk text into smaller pieces
export function chunkText(text, chunkSize = 500) {
  const words = text.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate embeddings for text
export async function generateEmbedding(text) {
  if (!MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY not configured');
  }

  const response = await mistral.embeddings.create({
    model: 'mistral-embed',
    inputs: [text]
  });

  return response.data[0].embedding;
}

export { MISTRAL_API_KEY };