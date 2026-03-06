// types.ts - Enhanced with Multi-Tenant Support + RAG + Sales Chart

// ============================================
// TENANT & USER TYPES
// ============================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';

  monthlyMessageLimit: number;
  monthlyMessagesUsed: number;
  storageLimitMb: number;
  storageUsedMb: number;

  createdAt: number;
  trialEndsAt?: number;
  subscriptionEndsAt?: number;
}

export interface User {
  id: string;
  tenantId: string;
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
// CORE TYPES
// ============================================

export type Language = 'vi' | 'en' | 'ja';
export type Feedback = 'up' | 'down';

export interface KnowledgeItem {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  dateAdded: number;
  source?: string;
  fileName?: string;
  fileType?: string;
  fileSizeBytes?: number;
  status?: 'active' | 'processing' | 'archived';
  chunkCount?: number;
}

export interface Message {
  id: string;
  tenantId?: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  feedback?: Feedback;
  language?: Language;

  // RAG metadata
  ragUsed?: boolean;
  ragChunks?: number;
  ragSimilarity?: number;

  // 🆕 Sales chart
  chartData?: {
    chartType: 'line' | 'bar' | 'pie' | 'table';
    data: Record<string, any>[];
    xKey: string;
    yKey: string;
    title: string;
  };
}

export interface FeedbackLog {
  id: string;
  tenantId?: string;
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

export interface RAGMetadata {
  used: boolean;
  chunksCount: number;
  similarity: number;
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalChunks: number;
  storageUsedMb: number;
  lastUpdated: number;
}

// ============================================
// APP CONFIG
// ============================================

export interface AppConfig {
  tenantId?: string;

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

  // Advanced
  temperature?: number;
  maxTokens?: number;
  model?: string;

  // Admin (deprecated)
  adminPassword?: string;

  // 🆕 Sales service
  salesServiceUrl?: string; // e.g. "http://localhost:4000"
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
  supportedLanguages: ['vi', 'en', 'ja'],
  temperature: 0.7,
  maxTokens: 1000,
  model: 'gemini-flash-latest',
  salesServiceUrl: '',
};

// ============================================
// CHAT WIDGET PROPS
// ============================================

export interface ChatWidgetProps {
  config: AppConfig;
  isEmbedded?: boolean;
}

// ============================================
// API KEY TYPE
// ============================================

export interface ApiKey {
  id: string;
  tenantId: string;
  keyPrefix: string;
  name: string;
  scopes: string[];
  status: 'active' | 'revoked';
  lastUsedAt?: number;
  createdAt: number;
  expiresAt?: number;
}

// ============================================
// USAGE TRACKING
// ============================================

export interface UsageStats {
  tenantId: string;
  period: string;
  messagesCount: number;
  storageUsedMb: number;
  apiCallsCount: number;
  costCents: number;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface ConversationStats {
  tenantId: string;
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  satisfactionRate: number;
  topQuestions: { question: string; count: number }[];
  peakHours: { hour: number; count: number }[];
  languageDistribution: { language: Language; percentage: number }[];
}

// ============================================
// UI STRINGS
// ============================================

export const UI_STRINGS = {
  vi: {
    placeholder: 'Nhập tin nhắn...',
    poweredBy: 'Hỗ trợ bởi Gemini AI',
    typing: 'Đang soạn...',
    online: 'Trực tuyến',
    offline: 'Ngoại tuyến',
    ragActive: 'Sử dụng kiến thức nội bộ',
    ragInactive: 'Kiến thức chung',
    documentsAvailable: 'tài liệu',
  },
  en: {
    placeholder: 'Type a message...',
    poweredBy: 'Powered by Gemini AI',
    typing: 'Typing...',
    online: 'Online',
    offline: 'Offline',
    ragActive: 'Using knowledge base',
    ragInactive: 'General knowledge',
    documentsAvailable: 'documents',
  },
  ja: {
    placeholder: 'メッセージを入力...',
    poweredBy: 'Gemini AI 搭載',
    typing: '入力中...',
    online: 'オンライン',
    offline: 'オフライン',
    ragActive: 'ナレッジベースを使用中',
    ragInactive: '一般知識',
    documentsAvailable: '件のドキュメント',
  }
};

// ============================================
// SENDER ENUM
// ============================================

export enum Sender {
  USER = 'user',
  BOT = 'bot'
}

// ============================================
// PLAN LIMITS
// ============================================

export const PLAN_LIMITS = {
  free: {
    monthlyMessages: 1000,
    storageMb: 100,
    maxUsers: 1,
    apiAccess: false,
    customBranding: false,
    advancedAnalytics: false,
  },
  pro: {
    monthlyMessages: 10000,
    storageMb: 1024,
    maxUsers: 5,
    apiAccess: true,
    customBranding: true,
    advancedAnalytics: true,
  },
  enterprise: {
    monthlyMessages: -1,
    storageMb: -1,
    maxUsers: -1,
    apiAccess: true,
    customBranding: true,
    advancedAnalytics: true,
  }
};

// ============================================
// ERROR TYPES
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