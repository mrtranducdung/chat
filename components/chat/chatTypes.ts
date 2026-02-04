import { Message, Language, AppConfig, Feedback } from '../../types';

// Re-export for convenience
export type { AppConfig };

// Type for useChatLogic hook return
export interface UseChatLogicReturn {
  // State
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isLangMenuOpen: boolean;
  setIsLangMenuOpen: (open: boolean) => void;
  unreadCount: number;
  isOnline: boolean;
  error: string | null;
  retryMessage: string | null;
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  audioRef: React.RefObject<HTMLAudioElement>;
  
  // Handlers
  handleFeedback: (messageId: string, text: string, type: Feedback) => void;
  copyToClipboard: (text: string) => void;
  startNewConversation: () => void;
  regenerateResponse: (messageId: string) => void;
  handleClose: () => void;
  handleSendMessage: (textOverride?: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleRetry: () => void;
}

// Type for useDraggable hook return
export interface UseDraggableReturn {
  isDragging: boolean;
  position: { x: number; y: number };
  elementRef: React.RefObject<HTMLDivElement>;
  handleDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
}

// Type for useResizable hook return
export interface UseResizableReturn {
  isResizing: boolean;
  size: { width: number; height: number };
  elementRef: React.RefObject<HTMLDivElement>;
  handleResizeStart: (handle: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => 
    (e: React.MouseEvent | React.TouchEvent) => void;
}