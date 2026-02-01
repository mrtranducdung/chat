import { KnowledgeItem, Message, Language } from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getKnowledgeBase, getCurrentTenantId } from "./storageService";

// Use Vite's import.meta.env for frontend
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Debug logging
console.log('🔍 Gemini Service Initialized:');
console.log('- API Key exists:', !!API_KEY);
console.log('- API Key length:', API_KEY.length);
console.log('- API URL:', API_URL);

// Safety check
if (!API_KEY) {
  console.warn('⚠️ VITE_GEMINI_API_KEY not set in .env.local file! Client-side fallback won\'t work.');
}

// Direct AI instance for Client-Side fallback
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Streams response. Tries Backend first, falls back to Client-Side Gemini if Backend is down.
 */
export async function* generateResponseStream(
  history: Message[],
  currentQuery: string,
  _unusedKnowledgeBase: KnowledgeItem[], 
  botName: string,
  language: Language
) {
  const tenantId = getCurrentTenantId() || 'default';

  try {
    console.log('🚀 Attempting backend connection...');
    
    // 1. Try connecting to the custom Backend
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Include auth token if available
        ...(localStorage.getItem('auth_token') && {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        })
      },
      body: JSON.stringify({
        message: currentQuery,
        history: history.filter(m => m.id !== 'welcome'),
        botName,
        language,
        tenantId
      })
    });

    console.log('📡 Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', errorText);
      throw new Error(`Backend error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let hasReceivedData = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('✅ Backend stream completed');
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        hasReceivedData = true;
        yield chunk;
      }
    }

    if (!hasReceivedData) {
      throw new Error("No data received from backend");
    }

    return; // Successfully completed, exit

  } catch (error) {
    console.warn("⚠️ Backend unavailable, falling back to Client-Side Gemini.", error);
    
    // 2. Fallback: Client-Side Generation (Offline Mode)
    if (!genAI) {
      const errorMsg = language === 'en' 
        ? "AI service is not available. Please contact administrator." 
        : "Dịch vụ AI không khả dụng. Vui lòng liên hệ quản trị viên.";
      yield errorMsg;
      return;
    }

    try {
      console.log('🔄 Using client-side Gemini fallback...');
      
      const localKnowledge = await getKnowledgeBase();
      const contextText = localKnowledge
          .map(doc => `--- ${doc.title} ---\n${doc.content}`)
          .join("\n\n")
          .substring(0, 15000); 

      const langConfig = language === 'en' 
          ? { role: "Virtual Assistant", lang: "English", tone: "Professional" } 
          : { role: "Trợ lý ảo AI", lang: "Tiếng Việt", tone: "Chuyên nghiệp, ngắn gọn" };

      const systemInstruction = `You are ${botName}, a ${langConfig.role}.
Answer the user's question in ${langConfig.lang}.
Tone: ${langConfig.tone}.

Use the provided CONTEXT to answer if relevant. If not found in context, you may answer with general knowledge but mention that you are not sure.

CONTEXT:
${contextText || 'No context available.'}`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        systemInstruction
      });

      const contents = [
        ...history.filter(m => m.id !== 'welcome').map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { 
          role: 'user', 
          parts: [{ text: currentQuery }] 
        }
      ];

      const result = await model.generateContentStream({ contents });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }

      console.log('✅ Client-side generation completed');

    } catch (clientError) {
      console.error("❌ Client AI Error:", clientError);
      yield language === 'en' 
        ? "I am currently offline and cannot reach the AI service. Please check your internet connection." 
        : "Hiện tại tôi đang mất kết nối, vui lòng thử lại sau. (Lỗi kết nối AI)";
    }
  }
}

export const analyzeDocument = async (text: string): Promise<{ title: string }> => {
  if (!genAI) {
    return { title: "Tài liệu mới" };
  }

  try {
    const sampleText = text.substring(0, 5000); 
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `Analyze the following text and provide a very short title (under 10 words).
Respond ONLY with a JSON object in this format: {"title": "your title here"}

TEXT:
${sampleText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Try to parse JSON from response
    const jsonMatch = responseText.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { title: parsed.title || "Tài liệu mới" };
    }

    return { title: "Tài liệu mới" };

  } catch (error) {
    console.error("Analyze Error:", error);
    return { title: "Tài liệu mới" };
  }
};

export const detectLanguage = async (text: string): Promise<Language> => {
  if (!genAI) {
    return 'vi';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = `Identify the language of the following text. Return ONLY "vi" for Vietnamese or "en" for English.
Respond with just the two-letter code, nothing else.

Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim().toLowerCase();
    
    return responseText === 'en' ? 'en' : 'vi';
  } catch (error) {
    console.error("Language detection error:", error);
    return 'vi';
  }
};