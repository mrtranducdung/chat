
import { KnowledgeItem, AppConfig, DEFAULT_CONFIG, Feedback, FeedbackLog, FeedbackAnalysisResult } from '../types';

const API_URL = 'http://localhost:3001/api';
const CONFIG_KEY = 'gemini_bot_config';
const LOCAL_KNOWLEDGE_KEY = 'gemini_knowledge_base';
const LOCAL_FEEDBACK_KEY = 'gemini_feedback_logs';

// --- LOCAL STORAGE HELPERS (FALLBACK) ---

const getLocalKnowledge = (): KnowledgeItem[] => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_KNOWLEDGE_KEY) || '[]');
    } catch { return []; }
};

const saveLocalKnowledge = (items: KnowledgeItem[]) => {
    localStorage.setItem(LOCAL_KNOWLEDGE_KEY, JSON.stringify(items));
};

const getLocalFeedback = (): FeedbackLog[] => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_FEEDBACK_KEY) || '[]');
    } catch { return []; }
};

const saveLocalFeedback = (items: FeedbackLog[]) => {
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(items));
};

// --- ASYNC API CALLS WITH FALLBACK ---

export const getKnowledgeBase = async (): Promise<KnowledgeItem[]> => {
  try {
    const res = await fetch(`${API_URL}/knowledge`);
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (e) {
    console.warn("Backend unreachable. Using LocalStorage for Knowledge Base.");
    return getLocalKnowledge();
  }
};

export const saveKnowledgeItem = async (item: KnowledgeItem): Promise<KnowledgeItem[]> => {
  try {
    const res = await fetch(`${API_URL}/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error("Failed to save");
    
    // If server save works, we return the full list from server
    // Note: In a real app, we might just return the new item to save bandwidth
    const list = await getKnowledgeBase(); 
    return list;
  } catch (e) {
    console.warn("Backend unreachable. Saving to LocalStorage.");
    const current = getLocalKnowledge();
    // Generate a temporary ID for local items
    const newItem = { ...item, id: Date.now().toString(), dateAdded: Date.now() };
    const updated = [...current, newItem];
    saveLocalKnowledge(updated);
    return updated;
  }
};

export const deleteKnowledgeItem = async (id: string): Promise<KnowledgeItem[]> => {
  try {
    await fetch(`${API_URL}/knowledge/${id}`, { method: 'DELETE' });
    return getKnowledgeBase();
  } catch (e) {
    console.warn("Backend unreachable. Deleting from LocalStorage.");
    const current = getLocalKnowledge();
    const updated = current.filter(i => i.id !== id);
    saveLocalKnowledge(updated);
    return updated;
  }
};

export const getFeedbackLogs = async (): Promise<FeedbackLog[]> => {
  try {
    const res = await fetch(`${API_URL}/feedback`);
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch (e) {
    return getLocalFeedback();
  }
};

export const saveFeedback = async (id: string, text: string, feedback: Feedback, userQuery?: string): Promise<void> => {
  try {
    await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, text, feedback, userQuery })
    });
  } catch (e) {
    const current = getLocalFeedback();
    const existingIdx = current.findIndex(f => f.id === id);
    const record = { id, text, feedback, userQuery, timestamp: Date.now() };
    if (existingIdx >= 0) {
        current[existingIdx] = record;
    } else {
        current.push(record);
    }
    saveLocalFeedback(current);
  }
};

export const analyzeFeedbackTrends = async (): Promise<FeedbackAnalysisResult | null> => {
    try {
        const res = await fetch(`${API_URL}/analyze-feedback`, { method: 'POST' });
        if (!res.ok) throw new Error("Analysis failed");
        return await res.json();
    } catch (e) {
        // Fallback: Simple client-side stats
        const logs = getLocalFeedback();
        if (logs.length === 0) return null;
        
        const positive = logs.filter(f => f.feedback === 'up').length;
        const score = Math.round((positive / logs.length) * 100);
        
        return {
            sentimentScore: score,
            summary: "Đang chạy chế độ Offline. Không thể phân tích chi tiết AI.",
            commonIssues: ["Backend disconnected", "Check console logs"]
        };
    }
}

// --- SYNC LOCAL STORAGE ---

export const getConfig = (): AppConfig => {
  try {
    const data = localStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
};

export const saveConfig = (config: AppConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};
