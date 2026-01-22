
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenAI, Type } = require('@google/genai');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// --- CONFIGURATION ---
const API_KEY = process.env.API_KEY; 
if (!API_KEY) {
  console.error("ERROR: API_KEY is missing in .env file");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- IN-MEMORY DATABASE ---
let knowledgeVectorStore = []; 
let feedbackStore = [];

// Helper: Calculate Cosine Similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

// Helper: Get Embedding
async function getEmbedding(text) {
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    content: { parts: [{ text }] }
  });
  return response.embeddings[0].values;
}

// --- API ROUTES ---

// 1. Get Knowledge Base
app.get('/api/knowledge', (req, res) => {
  const data = knowledgeVectorStore.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content, 
    dateAdded: item.dateAdded,
    fileName: item.fileName
  }));
  res.json(data);
});

// 2. Add to Knowledge Base
app.post('/api/knowledge', async (req, res) => {
  try {
    const { title, content, fileName } = req.body;
    const vector = await getEmbedding(content);

    const newItem = {
      id: Date.now().toString(),
      title,
      content,
      fileName,
      dateAdded: Date.now(),
      embedding: vector
    };

    knowledgeVectorStore.push(newItem);
    res.json(newItem);
  } catch (error) {
    console.error("Error adding knowledge:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Delete Knowledge
app.delete('/api/knowledge/:id', (req, res) => {
  const { id } = req.params;
  knowledgeVectorStore = knowledgeVectorStore.filter(item => item.id !== id);
  res.json({ success: true });
});

// 4. CHAT Endpoint (Optimized Prompt)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, language, botName } = req.body;

    // A. Vector Search
    let contextText = "";
    if (knowledgeVectorStore.length > 0) {
      const queryEmbedding = await getEmbedding(message);
      
      const rankedDocs = knowledgeVectorStore.map(doc => ({
        ...doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding)
      })).sort((a, b) => b.score - a.score);

      const topDocs = rankedDocs.slice(0, 3).filter(doc => doc.score > 0.45); 
      
      contextText = topDocs.map(doc => `
--- SOURCE (${doc.title}) ---
${doc.content}
------------------------------
`).join("\n");
    }

    // B. Build Optimized Prompt
    const langConfig = language === 'en' 
    ? { role: "Virtual Assistant", lang: "English", tone: "Professional, concise, and helpful." } 
    : { role: "Trợ lý ảo AI", lang: "Tiếng Việt", tone: "Chuyên nghiệp, ngắn gọn, thân thiện và lịch sự." };

    const systemInstruction = `
ROLE: You are ${botName}, a ${langConfig.role}.
GOAL: Answer the user's question accurately using ONLY the provided CONTEXT.

CONTEXT:
${contextText ? contextText : "No relevant documents found in the database."}

INSTRUCTIONS:
1. **Strict Grounding:** If the answer is NOT in the CONTEXT, politely state that you do not have that information based on the current documents. Do NOT make up facts.
2. **Language:** ALWAYS answer in ${langConfig.lang}.
3. **Tone:** ${langConfig.tone}.
4. **Formatting:** Use Markdown (bold, lists, bullet points) to make the answer easy to read. Do not use H1 or H2 tags, use H3 for headings.
5. **Directness:** Get straight to the point. Avoid fluff phrases like "Based on the context provided".

Check context availability:
- If CONTEXT is empty or irrelevant -> Apologize and suggest contacting support.
- If CONTEXT has the answer -> Synthesize it clearly.
    `;

    // C. Stream Response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Lower temperature for more factual answers
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    for await (const chunk of responseStream) {
        if (chunk.text) {
            res.write(chunk.text);
        }
    }
    res.end();

  } catch (error) {
    console.error("Chat Error:", error);
    res.write("Error connecting to server.");
    res.end();
  }
});

// 5. Feedback Routes
app.get('/api/feedback', (req, res) => {
  res.json(feedbackStore);
});

app.post('/api/feedback', (req, res) => {
  const { id, text, feedback, userQuery } = req.body;
  const record = { id, text, feedback, userQuery, timestamp: Date.now() };
  
  const existingIndex = feedbackStore.findIndex(f => f.id === id);
  if (existingIndex >= 0) {
    feedbackStore[existingIndex] = record;
  } else {
    feedbackStore.push(record);
  }
  res.json({ success: true });
});

// 6. NEW: Analyze Feedback (Sentiment & Issues)
app.post('/api/analyze-feedback', async (req, res) => {
  try {
    const negativeFeedback = feedbackStore.filter(f => f.feedback === 'down');
    
    if (negativeFeedback.length === 0) {
        return res.json({ 
            sentimentScore: 100, 
            summary: "Không có phản hồi tiêu cực nào.", 
            commonIssues: [] 
        });
    }

    // Limit to last 20 negative items to save tokens
    const samples = negativeFeedback.slice(0, 20).map(f => 
        `User asked: "${f.userQuery || 'Unknown'}" -> Bot answered: "${f.text.substring(0, 100)}..."`
    ).join('\n');

    const prompt = `
    Analyze the following list of negative user feedback interactions (Thumbs down) for a Chatbot.
    
    INTERACTIONS:
    ${samples}
    
    TASK:
    1. Identify the common reasons why users are dissatisfied (e.g., Wrong answer, Hallucination, Formatting, Language).
    2. Write a 1-sentence summary of the main problem.
    3. List 3 specific bullet points of common issues.

    Return JSON format:
    {
        "summary": "String",
        "commonIssues": ["String", "String", "String"]
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    commonIssues: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
    });

    const analysis = JSON.parse(response.text);
    
    // Calculate Score (Simple ratio)
    const total = feedbackStore.length;
    const positive = feedbackStore.filter(f => f.feedback === 'up').length;
    const score = total === 0 ? 0 : Math.round((positive / total) * 100);

    res.json({
        sentimentScore: score,
        summary: analysis.summary,
        commonIssues: analysis.commonIssues
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze feedback" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
