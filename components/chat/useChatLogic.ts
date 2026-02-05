import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import copy from 'copy-to-clipboard';
import { Message, Sender, Language, Feedback, AppConfig } from '../../types';
// import { generateResponseStream, detectLanguage } from '../../services/geminiService';
import { generateResponseStream,  detectLanguage } from '../../services/mistralService';
import { saveFeedback } from '../../services/storageService';

const findLastUserQuery = (msgs: Message[], botMsgIndex: number): string => {
  for (let i = botMsgIndex - 1; i >= 0; i--) {
    if (msgs[i].sender === Sender.USER) return msgs[i].text;
  }
  return "";
};

export const useChatLogic = (config: AppConfig, isEmbedded: boolean) => {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [language, setLanguage] = useState<Language>(config.defaultLanguage || 'vi');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationId, setConversationId] = useState(Date.now().toString());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: config.welcomeMessage,
      sender: Sender.BOT,
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      if (!isEmbedded) {
        document.title = "Gemini AI Chatbot Widget";
      }
    }
  }, [isOpen, isEmbedded]);

  // Load chat history
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_history_${config.tenantId}`);
    if (savedMessages && !isEmbedded) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed.length > 1) {
          setMessages(parsed);
        }
      } catch (e) {
        console.warn('Failed to load chat history');
      }
    }
  }, [config.tenantId, isEmbedded]);

  // Save chat history
  useEffect(() => {
    if (messages.length > 1 && !isEmbedded) {
      localStorage.setItem(`chat_history_${config.tenantId}`, JSON.stringify(messages));
    }
  }, [messages, config.tenantId, isEmbedded]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(language === 'vi' ? 'Đã kết nối lại' : 'Back online', { duration: 2000 });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error(language === 'vi' ? 'Mất kết nối internet' : 'You are offline', { duration: 3000 });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language]);

  const incrementUnread = () => {
    if (!isOpen && !isEmbedded) {
      setUnreadCount(prev => {
        const newCount = prev + 1;
        document.title = `(${newCount}) Tin nhắn mới - Gemini Chatbot`;
        return newCount;
      });
      if (config.enableSound && audioRef.current) {
        audioRef.current.play().catch((e) => console.warn("Audio play failed:", e));
      }
    }
  };

  const handleFeedback = (messageId: string, text: string, type: Feedback) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    const userQuery = findLastUserQuery(messages, msgIndex);

    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback: type } : msg
    ));
    saveFeedback(messageId, text, type, userQuery);
    
    toast.success(
      type === 'up' 
        ? (language === 'vi' ? 'Cảm ơn phản hồi!' : 'Thanks for your feedback!') 
        : (language === 'vi' ? 'Chúng tôi sẽ cải thiện' : 'We\'ll improve'),
      { duration: 2000 }
    );
  };

  const copyToClipboard = (text: string) => {
    const success = copy(text);
    
    if (success) {
      toast.success(language === 'vi' ? 'Đã sao chép!' : 'Copied to clipboard!', {
        duration: 2000,
        position: 'top-center',
      });
    } else {
      toast.error(language === 'vi' ? 'Không thể sao chép' : 'Failed to copy', {
        duration: 2000
      });
    }
  };

  const startNewConversation = () => {
    setMessages([{
      id: 'welcome',
      text: config.welcomeMessage,
      sender: Sender.BOT,
      timestamp: Date.now()
    }]);
    localStorage.removeItem(`chat_history_${config.tenantId}`);
    setConversationId(Date.now().toString());
    setError(null);
    setRetryMessage(null);
    toast.success(language === 'vi' ? 'Bắt đầu cuộc trò chuyện mới' : 'Started new conversation', {
      duration: 2000
    });
  };

  const regenerateResponse = async (messageId: string) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    
    const userQuery = findLastUserQuery(messages, msgIndex);
    if (!userQuery) return;
    
    setMessages(prev => prev.slice(0, msgIndex));
    toast.loading(language === 'vi' ? 'Đang tạo lại...' : 'Regenerating...', {
      duration: 1000
    });
    
    setTimeout(() => {
      handleSendMessage(userQuery);
    }, 500);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (window.parent !== window) {
      window.parent.postMessage('GEMINIBOT_CLOSE', '*');
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue.trim();
    if (!textToSend || isTyping) return;

    if (!isOnline) {
      toast.error(language === 'vi' ? 'Không có kết nối internet' : 'No internet connection', {
        duration: 3000
      });
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: Sender.USER,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setError(null);
    setRetryMessage(null);
    
    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: Message = {
      id: botMsgId,
      text: "", 
      sender: Sender.BOT,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, initialBotMsg]);

    try {
      let usedLanguage = language;
      if (textToSend.length > 2) {
        try {
           const detectedLang = await detectLanguage(textToSend);
           if (detectedLang !== language) {
             setLanguage(detectedLang);
             usedLanguage = detectedLang;
           }
        } catch (e) {
          console.warn("Skipping language detection due to error");
        }
      }

      const stream = generateResponseStream(
        [...messages, userMsg],
        textToSend,
        [], 
        config.botName,
        usedLanguage
      );

      let fullText = "";

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => 
          prev.map(msg => msg.id === botMsgId ? { ...msg, text: fullText } : msg)
        );
      }
      incrementUnread();

    } catch (error) {
      console.error(error);
      setError(language === 'vi' ? 'Không thể kết nối' : 'Connection failed');
      setRetryMessage(textToSend);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { 
              ...msg, 
              text: language === 'vi' 
                ? '❌ Không thể kết nối. Vui lòng thử lại.' 
                : '❌ Connection failed. Please try again.' 
            } 
          : msg
      ));
      toast.error(language === 'vi' ? 'Lỗi kết nối' : 'Connection error', {
        duration: 3000
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    if (retryMessage) {
      setError(null);
      handleSendMessage(retryMessage);
    }
  };

  return {
    // State
    isOpen,
    setIsOpen,
    language,
    setLanguage,
    isLangMenuOpen,
    setIsLangMenuOpen,
    unreadCount,
    isOnline,
    error,
    retryMessage,
    messages,
    inputValue,
    setInputValue,
    isTyping,
    messagesEndRef,
    scrollContainerRef,
    audioRef,
    
    // Handlers
    handleFeedback,
    copyToClipboard,
    startNewConversation,
    regenerateResponse,
    handleClose,
    handleSendMessage,
    handleKeyDown,
    handleRetry,
  };
};