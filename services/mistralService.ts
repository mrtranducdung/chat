import { KnowledgeItem, Message, Language, RAGMetadata } from "../types";
import { getCurrentTenantId } from "./storageService";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Streams response with RAG detection. Returns RAG metadata at the end.
 */
export async function* generateResponseStream(
  history: Message[],
  currentQuery: string,
  _unusedKnowledgeBase: KnowledgeItem[], 
  botName: string,
  language: Language
): AsyncGenerator<string, RAGMetadata, undefined> {
  const tenantId = getCurrentTenantId() || 'default';

  try {
    console.log('🚀 Attempting backend connection...');
    
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
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

    // ✅ Extract RAG metadata from response headers
    const ragUsed = response.headers.get('X-RAG-Used') === 'true';
    const ragChunks = parseInt(response.headers.get('X-RAG-Chunks') || '0');
    const ragSimilarity = parseFloat(response.headers.get('X-RAG-Similarity') || '0');

    console.log(`🧠 RAG Status: ${ragUsed ? '✅ USED' : '❌ NOT USED'} | Chunks: ${ragChunks} | Similarity: ${ragSimilarity.toFixed(3)}`);

    if (!response.body) {
      throw new Error("No response body");
    }

    // Stream the text response
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

    // ✅ Return RAG metadata as final value
    return {
      used: ragUsed,
      chunksCount: ragChunks,
      similarity: ragSimilarity
    };

  } catch (error) {
    console.error("❌ Mistral Backend Error:", error);
    
    const errorMsg = language === 'en' 
      ? "AI service is not available. Please contact administrator." 
      : "Dịch vụ AI không khả dụng. Vui lòng liên hệ quản trị viên.";
    
    yield errorMsg;
    
    return {
      used: false,
      chunksCount: 0,
      similarity: 0
    };
  }
}

export const analyzeDocument = async (text: string): Promise<{ title: string }> => {
  try {
    const sampleText = text.substring(0, 5000);
    const firstLine = sampleText
      .split('\n')
      .find(line => line.trim().length > 0)
      ?.slice(0, 50)
      .trim();
    
    return { title: firstLine || "Tài liệu mới" };

  } catch (error) {
    console.error("Analyze Error:", error);
    return { title: "Tài liệu mới" };
  }
};

export const detectLanguage = async (text: string): Promise<Language> => {
  try {
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return vietnamesePattern.test(text) ? 'vi' : 'en';
  } catch (error) {
    console.error("Language detection error:", error);
    return 'vi';
  }
};