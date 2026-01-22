
import { KnowledgeItem, Message, Language } from "../types";
import { GoogleGenAI, Type } from "@google/genai";
import { getKnowledgeBase } from "./storageService";

// Direct AI instance for Client-Side fallback
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const API_URL = 'http://localhost:3001/api';

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
  try {
    // 1. Try connecting to the custom Backend
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: currentQuery,
        history: history.filter(m => m.id !== 'welcome'), // Send only relevant history
        botName,
        language
      })
    });

    if (!response.ok || !response.body) throw new Error("Backend unavailable");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }

  } catch (error) {
    console.warn("Backend unavailable, falling back to Client-Side Gemini.", error);
    
    // 2. Fallback: Client-Side Generation (Offline Mode)
    
    // Simple RAG simulation: Get all local knowledge and dump into context
    const localKnowledge = await getKnowledgeBase();
    // Limit context to avoid token limits in client mode (simple strategy)
    const contextText = localKnowledge
        .map(doc => `--- ${doc.title} ---\n${doc.content}`)
        .join("\n\n")
        .substring(0, 15000); 

    const langConfig = language === 'en' 
        ? { role: "Virtual Assistant", lang: "English", tone: "Professional" } 
        : { role: "Trợ lý ảo AI", lang: "Tiếng Việt", tone: "Chuyên nghiệp, ngắn gọn" };

    const systemInstruction = `
    You are ${botName}, a ${langConfig.role}.
    Answer the user's question in ${langConfig.lang}.
    Tone: ${langConfig.tone}.
    
    Use the provided CONTEXT to answer if relevant. If not found in context, you may answer with general knowledge but mention that you are not sure.
    
    CONTEXT:
    ${contextText}
    `;

    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents: [
                ...history.filter(m => m.id !== 'welcome').map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                })),
                { role: 'user', parts: [{ text: currentQuery }] }
            ],
            config: { systemInstruction }
        });

        for await (const chunk of stream) {
            yield chunk.text || "";
        }
    } catch (clientError) {
        console.error("Client AI Error:", clientError);
         yield language === 'en' 
          ? "I am currently offline and cannot reach the AI service. Please check your internet connection." 
          : "Hiện tại tôi đang mất kết nối, vui lòng thử lại sau. (Lỗi kết nối AI)";
    }
  }
}

export const analyzeDocument = async (text: string): Promise<{ title: string }> => {
  try {
    const sampleText = text.substring(0, 5000); 

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the text and provide a very short title (under 10 words).
      
      TEXT:
      ${sampleText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as { title: string };
    }
    return { title: "Tài liệu mới" };

  } catch (error) {
    console.error("Analyze Error:", error);
    return { title: "Tài liệu mới" };
  }
};

export const detectLanguage = async (text: string): Promise<Language> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify the language of the following text. Return "vi" for Vietnamese and "en" for English.
      
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { 
              type: Type.STRING,
              enum: ["vi", "en"]
            },
          },
          required: ["language"]
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return result.language as Language;
    }
    return 'vi'; 
  } catch (error) {
    return 'vi';
  }
};
