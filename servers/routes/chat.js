import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { db } from '../config/database.js';
import { cosineSimilarity } from '../utils/rags.js';
import { Mistral } from '@mistralai/mistralai';
import { MISTRAL_API_KEY } from '../config/env.js';

const router = Router();
const mistral = new Mistral({ apiKey: MISTRAL_API_KEY });

// ============================================
// CHAT ENDPOINT WITH RAG
// ============================================

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { message, history, botName, language, tenantId: bodyTenantId } = req.body;
    
    if (!MISTRAL_API_KEY) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const tenantId = req.user?.tenantId || bodyTenantId || 'default';

    console.log(`💬 Chat request - Tenant: ${tenantId}, Language: ${language}`);

    // ════════════════════════════════════════════════
    // RAG: Search for relevant chunks
    // ════════════════════════════════════════════════
    
    let contextText = '';
    let ragUsed = false; // ✅ Track RAG usage
    let ragChunksCount = 0; // ✅ Track number of chunks used
    let ragSimilarity = 0; // ✅ Track max similarity
    
    try {
      // Generate embedding for user query
      const queryEmbeddingResponse = await mistral.embeddings.create({
        model: 'mistral-embed',
        inputs: [message]
      });
      const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

      // Get all chunks for tenant
      const chunks = db.prepare(`
        SELECT id, chunk_text, embedding 
        FROM document_chunks 
        WHERE tenant_id = ?
      `).all(tenantId);

      if (chunks.length > 0) {
        console.log(`🔍 RAG: Searching ${chunks.length} chunks...`);

        // Calculate similarity for each chunk
        const results = chunks.map(chunk => {
          const chunkEmbedding = JSON.parse(chunk.embedding);
          const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
          return { text: chunk.chunk_text, similarity };
        });

        // Get top 3 most relevant chunks
        results.sort((a, b) => b.similarity - a.similarity);
        const topChunks = results.slice(0, 3);

        // Only use chunks with similarity > 0.3 (30%)
        if (topChunks[0].similarity > 0.3) {
          contextText = topChunks.map((c, i) => `[Chunk ${i+1}] ${c.text}`).join('\n\n');
          ragUsed = true; // ✅ Mark as used
          ragChunksCount = topChunks.length;
          ragSimilarity = topChunks[0].similarity;
          console.log(`✅ RAG: Found ${topChunks.length} relevant chunks (similarity: ${topChunks[0].similarity.toFixed(3)})`);
        } else {
          console.log(`⚠️  RAG: No highly relevant chunks (max similarity: ${topChunks[0].similarity.toFixed(3)})`);
        }
      } else {
        console.log('📭 RAG: No chunks available');
      }
    } catch (ragError) {
      console.error('RAG search failed, continuing without context:', ragError);
    }

    // ════════════════════════════════════════════════
    // Build system prompt with RAG context
    // ════════════════════════════════════════════════

    const systemInstruction = language === 'vi'
      ? `Bạn là ${botName || 'trợ lý AI'}. Trả lời bằng tiếng Việt, ngắn gọn và chuyên nghiệp.

${contextText ? `NGỮ CẢNH TÀI LIỆU:
${contextText}

Nếu câu hỏi liên quan đến tài liệu trên, hãy sử dụng thông tin đó để trả lời.` : 'Không có tài liệu nào.'}

Nếu không tìm thấy thông tin trong tài liệu, trả lời dựa trên kiến thức chung và nói rõ là bạn không chắc chắn.`
      : language === 'ja'
      ? `あなたは${botName || 'AIアシスタント'}です。日本語で簡潔かつ丁寧に回答してください。

${contextText ? `ドキュメントのコンテキスト:
${contextText}

質問が上記のドキュメントに関連している場合は、その情報を使って回答してください。` : 'ドキュメントはありません。'}

ドキュメントに情報が見つからない場合は、一般的な知識に基づいて回答し、不確かな点は明示してください。`
      : `You are ${botName || 'an AI assistant'}. Answer in English, concisely and professionally.

${contextText ? `DOCUMENT CONTEXT:
${contextText}

If the question relates to the documents above, use that information to answer.` : 'No documents available.'}

If information is not found in documents, answer based on general knowledge and mention uncertainty.`;

    // ════════════════════════════════════════════════
    // Set headers (including RAG metadata)
    // ════════════════════════════════════════════════
    
    // ✅ Set RAG headers BEFORE streaming starts
    res.setHeader('X-RAG-Used', ragUsed ? 'true' : 'false');
    res.setHeader('X-RAG-Chunks', ragChunksCount.toString());
    res.setHeader('X-RAG-Similarity', ragSimilarity.toFixed(3));
    
    // Standard streaming headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');

    // ════════════════════════════════════════════════
    // Build messages array for Mistral
    // ════════════════════════════════════════════════

    const messages = [
      { role: 'system', content: systemInstruction },
      ...history.filter(m => m.id !== 'welcome').map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    // ════════════════════════════════════════════════
    // Stream response from Mistral
    // ════════════════════════════════════════════════

    console.log(`🤖 Sending to Mistral AI...`);

    const chatStream = await mistral.chat.stream({
      model: 'mistral-large-latest',
      messages: messages,
    });

    let totalChunks = 0;
    for await (const chunk of chatStream) {
      const content = chunk.data.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
        totalChunks++;
      }
    }
    
    res.end();
    console.log(`✅ Chat response completed (${totalChunks} chunks streamed)`);

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    // If headers not sent yet, send error JSON
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to process message', 
        details: error.message 
      });
    } else {
      // If streaming already started, just end it
      res.end();
    }
  }
});

export default router;