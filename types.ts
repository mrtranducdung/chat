
export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export type Language = 'vi' | 'en';

export type Feedback = 'up' | 'down';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  feedback?: Feedback;
}

export interface FeedbackLog {
  id: string;
  text: string;
  userQuery?: string; // Optional: Capture what the user asked
  feedback: Feedback;
  timestamp: number;
}

export interface FeedbackAnalysisResult {
  sentimentScore: number;
  summary: string;
  commonIssues: string[];
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string; // The extracted text from the file or manual input
  fileName?: string;
  dateAdded: number;
}

export interface AppConfig {
  botName: string;
  welcomeMessage: string;
  primaryColor: string;
  enableSound: boolean;
  soundUrl: string;
  theme: 'light' | 'dark';
  suggestedQuestions: string[]; // NEW: List of quick questions
  adminPassword?: string; // NEW: Simple protection
}

// Default configuration
export const DEFAULT_CONFIG: AppConfig = {
  botName: "Trợ lý AI",
  welcomeMessage: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
  primaryColor: "#2563eb", // blue-600
  enableSound: true,
  soundUrl: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  theme: 'light',
  suggestedQuestions: [
    "Dịch vụ này có phí không?",
    "Làm sao để đăng ký tài khoản?",
    "Chính sách bảo hành như thế nào?"
  ],
  adminPassword: "admin" 
};

export const UI_STRINGS = {
  vi: {
    placeholder: "Nhập câu hỏi của bạn...",
    poweredBy: "Hỗ trợ bởi Gemini AI",
    thinking: "Đang trả lời...",
    langName: "Tiếng Việt"
  },
  en: {
    placeholder: "Type your question...",
    poweredBy: "Powered by Gemini AI",
    thinking: "Typing...",
    langName: "English"
  }
};
