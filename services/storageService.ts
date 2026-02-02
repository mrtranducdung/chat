// storageService.ts - Enhanced with Multi-Tenant Support
import { 
  KnowledgeItem, 
  AppConfig, 
  DEFAULT_CONFIG, 
  Feedback, 
  FeedbackLog, 
  FeedbackAnalysisResult,
  Tenant,
  User,
  AuthToken
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com') 
    ? 'https://geminibot-backend.onrender.com/api' 
    : 'http://localhost:3001/api');

// ============================================
// TENANT CONTEXT (NEW)
// ============================================

/**
 * Get current tenant ID from auth token
 */
export const getCurrentTenantId = (): string | null => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    // Decode JWT (simple base64 decode, don't verify - backend does that)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.tenantId || null;
  } catch {
    return null;
  }
};

/**
 * Get current user from storage
 */
export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem('current_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

/**
 * Get current tenant from storage
 */
export const getCurrentTenant = (): Tenant | null => {
  try {
    const tenantData = localStorage.getItem('current_tenant');
    return tenantData ? JSON.parse(tenantData) : null;
  } catch {
    return null;
  }
};

/**
 * Save auth data after login/register
 */
export const saveAuthData = (authData: AuthToken): void => {
  localStorage.setItem('auth_token', authData.token);
  localStorage.setItem('current_user', JSON.stringify(authData.user));
  localStorage.setItem('current_tenant', JSON.stringify(authData.tenant));
};

/**
 * Clear auth data on logout
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
  localStorage.removeItem('current_tenant');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

// ============================================
// HEADERS WITH AUTH (NEW)
// ============================================

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ============================================
// LOCAL STORAGE KEYS (TENANT-SCOPED)
// ============================================

/**
 * Generate tenant-specific storage key
 * This allows multiple tenants to use same browser without conflicts
 */
const getTenantKey = (baseKey: string): string => {
  const tenantId = getCurrentTenantId();
  if (!tenantId) return baseKey; // Fallback to global key
  return `tenant_${tenantId}_${baseKey}`;
};

const CONFIG_KEY = 'gemini_bot_config';
const KNOWLEDGE_KEY = 'gemini_knowledge_base';
const FEEDBACK_KEY = 'gemini_feedback_logs';

// ============================================
// LOCAL STORAGE HELPERS (TENANT-AWARE)
// ============================================

const getLocalKnowledge = (): KnowledgeItem[] => {
  try {
    const key = getTenantKey(KNOWLEDGE_KEY);
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { 
    return []; 
  }
};

const saveLocalKnowledge = (items: KnowledgeItem[]) => {
  const key = getTenantKey(KNOWLEDGE_KEY);
  localStorage.setItem(key, JSON.stringify(items));
};

const getLocalFeedback = (): FeedbackLog[] => {
  try {
    const key = getTenantKey(FEEDBACK_KEY);
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { 
    return []; 
  }
};

const saveLocalFeedback = (items: FeedbackLog[]) => {
  const key = getTenantKey(FEEDBACK_KEY);
  localStorage.setItem(key, JSON.stringify(items));
};

// ============================================
// KNOWLEDGE BASE API (TENANT-SCOPED)
// ============================================

export const getKnowledgeBase = async (): Promise<KnowledgeItem[]> => {
  try {
    const res = await fetch(`${API_URL}/knowledge`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        clearAuthData();
        window.location.href = '/login';
      }
      throw new Error("Failed to fetch");
    }
    
    return await res.json();
  } catch (e) {
    console.warn("Backend unreachable. Using LocalStorage for Knowledge Base.", e);
    return getLocalKnowledge();
  }
};

export const saveKnowledgeItem = async (item: KnowledgeItem): Promise<KnowledgeItem[]> => {
  try {
    const tenantId = getCurrentTenantId();
    
    const res = await fetch(`${API_URL}/knowledge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...item, tenantId }),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        clearAuthData();
        window.location.href = '/login';
      }
      throw new Error("Failed to save");
    }
    
    return await getKnowledgeBase();
  } catch (e) {
    console.warn("Backend unreachable. Saving to LocalStorage.", e);
    const current = getLocalKnowledge();
    const tenantId = getCurrentTenantId() || 'default';
    const newItem = { 
      ...item, 
      id: Date.now().toString(), 
      dateAdded: Date.now(),
      tenantId 
    };
    const updated = [...current, newItem];
    saveLocalKnowledge(updated);
    return updated;
  }
};

export const deleteKnowledgeItem = async (id: string): Promise<KnowledgeItem[]> => {
  try {
    await fetch(`${API_URL}/knowledge/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(5000)
    });
    return getKnowledgeBase();
  } catch (e) {
    console.warn("Backend unreachable. Deleting from LocalStorage.", e);
    const current = getLocalKnowledge();
    const updated = current.filter(i => i.id !== id);
    saveLocalKnowledge(updated);
    return updated;
  }
};

// ============================================
// FEEDBACK API (TENANT-SCOPED)
// ============================================

export const getFeedbackLogs = async (): Promise<FeedbackLog[]> => {
  try {
    const res = await fetch(`${API_URL}/feedback`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch (e) {
    return getLocalFeedback();
  }
};

export const saveFeedback = async (
  id: string, 
  text: string, 
  feedback: Feedback, 
  userQuery?: string
): Promise<void> => {
  try {
    const tenantId = getCurrentTenantId();
    
    await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, text, feedback, userQuery, tenantId }),
      signal: AbortSignal.timeout(5000)
    });
  } catch (e) {
    const current = getLocalFeedback();
    const tenantId = getCurrentTenantId() || 'default';
    const existingIdx = current.findIndex(f => f.id === id);
    const record = { id, text, feedback, userQuery, timestamp: Date.now(), tenantId };
    
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
    const res = await fetch(`${API_URL}/analyze-feedback`, { 
      method: 'POST',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(10000)
    });
    
    if (!res.ok) throw new Error("Analysis failed");
    return await res.json();
  } catch (e) {
    console.warn("Backend analysis unavailable. Using simple local stats.", e);
    const logs = getLocalFeedback();
    if (logs.length === 0) return null;
    
    const positive = logs.filter(f => f.feedback === 'up').length;
    const negative = logs.filter(f => f.feedback === 'down').length;
    const score = logs.length > 0 ? Math.round((positive / logs.length) * 100) : 0;
    
    return {
      sentimentScore: score,
      summary: `Tổng số phản hồi: ${logs.length}. Tích cực: ${positive}, Tiêu cực: ${negative}. Đang chạy chế độ Offline - không có phân tích AI chi tiết.`,
      commonIssues: ["Backend disconnected", "Check console logs for errors"]
    };
  }
};

// ============================================
// CONFIG (TENANT-SCOPED)
// ============================================

export const getConfig = (): AppConfig => {
  try {
    const key = getTenantKey(CONFIG_KEY);
    const data = localStorage.getItem(key);
    
    if (data) {
      const config = JSON.parse(data);
      // Add tenantId if missing
      const tenantId = getCurrentTenantId();
      return { ...config, tenantId };
    }
    
    return { ...DEFAULT_CONFIG, tenantId: getCurrentTenantId() };
  } catch (e) {
    return { ...DEFAULT_CONFIG, tenantId: getCurrentTenantId() };
  }
};

export const saveConfig = (config: AppConfig): void => {
  try {
    const key = getTenantKey(CONFIG_KEY);
    const tenantId = getCurrentTenantId();
    const configWithTenant = { ...config, tenantId };
    localStorage.setItem(key, JSON.stringify(configWithTenant));
  } catch (e) {
    console.error("Error saving config:", e);
  }
};

// ============================================
// AUTHENTICATION API (NEW)
// ============================================

export const register = async (data: {
  tenantName: string;
  tenantSlug: string;
  email: string;
  password: string;
  fullName: string;
}): Promise<AuthToken> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }

  const authData = await res.json();
  saveAuthData(authData);
  return authData;
};

export const login = async (email: string, password: string): Promise<AuthToken> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }

  const authData = await res.json();
  saveAuthData(authData);
  return authData;
};

export const logout = (): void => {
  clearAuthData();
  window.location.href = '/';
};

// ============================================
// TENANT INFO API (NEW)
// ============================================

export const getTenantInfo = async (): Promise<Tenant> => {
  const res = await fetch(`${API_URL}/tenant`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    throw new Error('Failed to fetch tenant info');
  }

  return await res.json();
};

export const updateTenantInfo = async (updates: Partial<Tenant>): Promise<Tenant> => {
  const res = await fetch(`${API_URL}/tenant`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });

  if (!res.ok) {
    throw new Error('Failed to update tenant info');
  }

  return await res.json();
};