// types.ts - Enhanced with Multi-Tenant Support

// ============================================
// TENANT & USER TYPES (NEW)
// ============================================

export interface Tenant {
  id: string;
  name: string;
  slug: string; // URL-friendly: "acme-corp"
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  
  // Limits
  monthlyMessageLimit: number;
  monthlyMessagesUsed: number;
  storageLimitMb: number;
  storageUsedMb: number;
  
  // Timestamps
  createdAt: number;
  trialEndsAt?: number;
  subscriptionEndsAt?: number;
}

export interface User {
  id: string;
  tenantId: string; // Links to tenant
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'viewer';
  
  emailVerified: boolean;
  lastLoginAt?: number;
  createdAt: number;
}

export interface AuthToken {
  token: string;
  user: User;
  tenant: Tenant;
}

// ============================================
// EXISTING TYPES (Enhanced with tenantId)
// ============================================

export type Language = 'vi' | 'en';
export type Feedback = 'up' | 'down';

// Knowledge Base Item - NOW WITH TENANT ID
export interface KnowledgeItem {
  id: string;
  tenantId: string; // NEW: Which tenant owns this
  title: string;
  content: string;
  dateAdded: number;
  source?: string;
  fileName?: string;
  fileType?: string;
  fileSizeBytes?: number;
  status?: 'active' | 'processing' | 'archived';
}

// Chat Message - NOW WITH TENANT ID
export interface Message {
  id: string;
  tenantId?: string; // NEW: Optional for backward compatibility
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  feedback?: Feedback;
  language?: Language;
}

// Feedback Log - NOW WITH TENANT ID
export interface FeedbackLog {
  id: string;
  tenantId?: string; // NEW
  text: string;
  feedback: Feedback;
  userQuery?: string;
  timestamp: number;
}

export interface FeedbackAnalysisResult {
  sentimentScore: number;
  summary: string;
  commonIssues: string[];
}

// ============================================
// APP CONFIG (Enhanced for Multi-Tenant)
// ============================================

export interface AppConfig {
  tenantId?: string; // NEW: Links config to tenant
  
  // Bot Identity
  botName: string;
  welcomeMessage: string;
  systemPrompt: string;
  
  // Appearance
  primaryColor: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
  
  // Features
  enableSound?: boolean;
  enableFeedback?: boolean;
  suggestedQuestions?: string[];
  
  // Language
  defaultLanguage?: Language;
  supportedLanguages?: Language[];
  
  // Advanced (for pro/enterprise)
  temperature?: number;
  maxTokens?: number;
  model?: string;
  
  // Admin (deprecated - moved to User table)
  adminPassword?: string; // Keep for backward compatibility
}

export const DEFAULT_CONFIG: AppConfig = {
  botName: 'GeminiBot',
  primaryColor: '#2563eb',
  welcomeMessage: 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn?',
  systemPrompt: 'You are a helpful AI assistant.',
  theme: 'light',
  position: 'bottom-right',
  enableSound: true,
  enableFeedback: true,
  suggestedQuestions: [],
  defaultLanguage: 'vi',
  supportedLanguages: ['vi', 'en'],
  temperature: 0.7,
  maxTokens: 1000,
  model: 'gemini-flash-latest'
};

// ============================================
// CHAT WIDGET PROPS (NEW)
// ============================================

export interface ChatWidgetProps {
  config: AppConfig;
  isEmbedded?: boolean; // When true, widget is in iframe/embed mode
}

// ============================================
// API KEY TYPE (NEW)
// ============================================

export interface ApiKey {
  id: string;
  tenantId: string;
  keyPrefix: string; // "gbot_live_abc..." (first 15 chars for display)
  name: string;
  scopes: string[];
  status: 'active' | 'revoked';
  lastUsedAt?: number;
  createdAt: number;
  expiresAt?: number;
}

// ============================================
// USAGE TRACKING (NEW)
// ============================================

export interface UsageStats {
  tenantId: string;
  period: string; // "2024-01"
  messagesCount: number;
  storageUsedMb: number;
  apiCallsCount: number;
  costCents: number;
}

// ============================================
// ANALYTICS TYPES (Enhanced)
// ============================================

export interface ConversationStats {
  tenantId: string;
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  satisfactionRate: number; // 0-100
  topQuestions: { question: string; count: number }[];
  peakHours: { hour: number; count: number }[];
  languageDistribution: { language: Language; percentage: number }[];
}

// ============================================
// UI STRINGS (Existing - No Change)
// ============================================

export const UI_STRINGS = {
  vi: {
    placeholder: 'Nhập tin nhắn...',
    poweredBy: 'Hỗ trợ bởi Gemini AI',
    typing: 'Đang soạn...',
    online: 'Trực tuyến',
    offline: 'Ngoại tuyến'
  },
  en: {
    placeholder: 'Type a message...',
    poweredBy: 'Powered by Gemini AI',
    typing: 'Typing...',
    online: 'Online',
    offline: 'Offline'
  }
};

// ============================================
// SENDER ENUM (Existing - No Change)
// ============================================

export enum Sender {
  USER = 'user',
  BOT = 'bot'
}

// ============================================
// PLAN LIMITS (NEW)
// ============================================

export const PLAN_LIMITS = {
  free: {
    monthlyMessages: 1000,
    storageMb: 100,
    maxUsers: 1,
    apiAccess: false,
    customBranding: false,
    advancedAnalytics: false
  },
  pro: {
    monthlyMessages: 10000,
    storageMb: 1024, // 1GB
    maxUsers: 5,
    apiAccess: true,
    customBranding: true,
    advancedAnalytics: true
  },
  enterprise: {
    monthlyMessages: -1, // Unlimited
    storageMb: -1, // Unlimited
    maxUsers: -1, // Unlimited
    apiAccess: true,
    customBranding: true,
    advancedAnalytics: true
  }
};

// ============================================
// ERROR TYPES (NEW)
// ============================================

export class TenantLimitError extends Error {
  constructor(
    public limitType: 'messages' | 'storage' | 'users',
    public current: number,
    public limit: number
  ) {
    super(`${limitType} limit reached: ${current}/${limit}`);
    this.name = 'TenantLimitError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}