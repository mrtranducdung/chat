import { KnowledgeItem, Message, Language } from "../types";
import { getKnowledgeBase, getCurrentTenantId } from "./storageService";

// Use Vite's import.meta.env for frontend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Streams response. Tries Backend first, falls back to error if Backend is down.
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
    
    // Try connecting to the custom Backend
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
    console.error("❌ Mistral Backend Error:", error);
    
    const errorMsg = language === 'en' 
      ? "AI service is not available. Please contact administrator." 
      : "Dịch vụ AI không khả dụng. Vui lòng liên hệ quản trị viên.";
    yield errorMsg;
    return;
  }
}

export const analyzeDocument = async (text: string): Promise<{ title: string }> => {
  try {
    const sampleText = text.substring(0, 5000);
    
    // Note: Server doesn't have /analyze endpoint yet
    // Using a fallback simple title generation
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