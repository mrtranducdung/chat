import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import toast, { Toaster } from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageCircleIcon, XIcon, SendIcon, UserIcon, ThumbsUpIcon, ThumbsDownIcon } from './Icons';
import { Message, Sender, ChatWidgetProps, Language, UI_STRINGS, Feedback } from '../types';
import { generateResponseStream, detectLanguage } from '../services/geminiService';
import { saveFeedback } from '../services/storageService';

const TypingIndicator = () => (
  <div className="flex space-x-1 h-4 items-center p-1">
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

// Helper for finding the last user message
const findLastUserQuery = (msgs: Message[], botMsgIndex: number): string => {
    for (let i = botMsgIndex - 1; i >= 0; i--) {
        if (msgs[i].sender === Sender.USER) return msgs[i].text;
    }
    return "";
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ config, isEmbedded = false }) => {
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

  const isDark = config.theme === 'dark';

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

  // Load chat history from localStorage
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

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1 && !isEmbedded) {
      localStorage.setItem(`chat_history_${config.tenantId}`, JSON.stringify(messages));
    }
  }, [messages, config.tenantId, isEmbedded]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(language === 'vi' ? 'Đã kết nối lại' : 'Back online', {
        duration: 2000
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error(language === 'vi' ? 'Mất kết nối internet' : 'You are offline', {
        duration: 3000
      });
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

    setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
            return { ...msg, feedback: type };
        }
        return msg;
    }));
    saveFeedback(messageId, text, type, userQuery);
    
    toast.success(
      type === 'up' 
        ? (language === 'vi' ? 'Cảm ơn phản hồi!' : 'Thanks for your feedback!') 
        : (language === 'vi' ? 'Chúng tôi sẽ cải thiện' : 'We\'ll improve'),
      { duration: 2000 }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(language === 'vi' ? 'Đã sao chép!' : 'Copied to clipboard!', {
        duration: 2000,
        position: 'top-center',
      });
    }).catch(() => {
      toast.error(language === 'vi' ? 'Không thể sao chép' : 'Failed to copy', {
        duration: 2000
      });
    });
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

  // Render message with enhanced features
  const renderMessage = (msg: Message, index: number) => (
    <div
      key={msg.id}
      className={`mb-4 flex flex-col ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}
    >
      <div className={`flex items-end gap-2 max-w-full ${msg.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'}`}>
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
            msg.sender === Sender.USER 
              ? (isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-500')
              : (isDark ? 'bg-gray-800 border-gray-700 text-blue-400' : 'bg-white border-blue-100 text-blue-600')
          }`}
          style={msg.sender === Sender.BOT && !isDark ? { color: config.primaryColor } : {}}
        >
          {msg.sender === Sender.USER ? <UserIcon className="w-5 h-5" /> : <MessageCircleIcon className="w-5 h-5" />}
        </div>

        <div
          className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm prose relative group ${
            msg.sender === Sender.USER
              ? 'bg-blue-600 text-white rounded-tr-none'
              : (isDark ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none')
          }`}
          style={msg.sender === Sender.USER ? { backgroundColor: config.primaryColor } : {}}
        >
          {msg.sender === Sender.BOT && isTyping && msg.id === messages[messages.length-1].id && msg.text === "" 
            ? <TypingIndicator />
            : (
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={isDark ? vscDarkPlus : prism}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {msg.text}
              </ReactMarkdown>
            )
          }
          
          {/* Timestamp on hover */}
          {msg.text && (
            <div className="absolute -bottom-5 left-0 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {new Date(msg.timestamp).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons for bot messages */}
      {config.enableFeedback && msg.sender === Sender.BOT && msg.id !== 'welcome' && msg.text !== "" && (
        <div className={`flex gap-1 mt-1 ml-10 transition-opacity duration-300 ${isTyping && index === messages.length - 1 ? 'opacity-0' : 'opacity-100'}`}>
          <button 
            onClick={() => handleFeedback(msg.id, msg.text, 'up')} 
            className={`p-1 hover:bg-gray-100/10 rounded transition-colors ${msg.feedback === 'up' ? 'text-green-600' : 'text-gray-400'}`}
            title={language === 'vi' ? 'Hữu ích' : 'Helpful'}
          >
            <ThumbsUpIcon className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => handleFeedback(msg.id, msg.text, 'down')} 
            className={`p-1 hover:bg-gray-100/10 rounded transition-colors ${msg.feedback === 'down' ? 'text-red-600' : 'text-gray-400'}`}
            title={language === 'vi' ? 'Không hữu ích' : 'Not helpful'}
          >
            <ThumbsDownIcon className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => copyToClipboard(msg.text)}
            className="p-1 hover:bg-gray-100/10 rounded transition-colors text-gray-400 hover:text-blue-600"
            title={language === 'vi' ? 'Sao chép' : 'Copy'}
          >
            📋
          </button>
          <button 
            onClick={() => regenerateResponse(msg.id)}
            className="p-1 hover:bg-gray-100/10 rounded transition-colors text-gray-400 hover:text-purple-600"
            title={language === 'vi' ? 'Tạo lại câu trả lời' : 'Regenerate'}
          >
            🔄
          </button>
        </div>
      )}
    </div>
  );

  // Header component
  const renderHeader = () => (
    <div 
      className="p-4 text-white flex justify-between items-center shadow-md relative z-10"
      style={{ backgroundColor: config.primaryColor }}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'} border-2 border-white/20`}></div>
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold text-base leading-tight">{config.botName}</h3>
          <span className="text-[10px] opacity-80 uppercase tracking-wider">
            {isOnline ? (language === 'vi' ? 'Trực tuyến' : 'Online') : (language === 'vi' ? 'Ngoại tuyến' : 'Offline')}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* New Chat Button */}
        <button 
          onClick={startNewConversation}
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
          title={language === 'vi' ? 'Cuộc trò chuyện mới' : 'New conversation'}
        >
          🔄
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-xs px-2 py-1 rounded transition-colors text-white font-medium"
          >
            {language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}
          </button>
          
          {isLangMenuOpen && (
            <>
              <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsLangMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-24 bg-white rounded-lg shadow-xl py-1 z-20 overflow-hidden animate-fade-in text-gray-800">
                <button 
                  onClick={() => { setLanguage('vi'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2 ${language === 'vi' ? 'text-blue-600 font-bold bg-blue-50' : ''}`}
                >
                  <span>🇻🇳</span> Tiếng Việt
                </button>
                <button 
                  onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2 ${language === 'en' ? 'text-blue-600 font-bold bg-blue-50' : ''}`}
                >
                  <span>🇺🇸</span> English
                </button>
              </div>
            </>
          )}
        </div>

        {/* Close Button (only for non-embedded) */}
        {!isEmbedded && (
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute top-full left-0 right-0 bg-red-500 text-white text-xs py-1 px-4 text-center">
          {language === 'vi' ? '⚠️ Không có kết nối' : '⚠️ No connection'}
        </div>
      )}
    </div>
  );

  // Input area component
  const renderInputArea = () => (
    <>
      <div className={`p-4 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={UI_STRINGS[language].placeholder}
            maxLength={2000}
            disabled={!isOnline}
            className={`w-full rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm
            ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-800'}
            ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{ '--tw-ring-color': config.primaryColor } as React.CSSProperties}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping || !isOnline}
            className="absolute right-2 p-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.primaryColor }}
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
          <span>{UI_STRINGS[language].poweredBy}</span>
          {inputValue && (
            <span className={inputValue.length > 1500 ? 'text-red-500' : ''}>
              {inputValue.length}/2000
            </span>
          )}
        </div>
      </div>

      {/* Error retry UI */}
      {error && retryMessage && (
        <div className="px-4 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs text-red-700">{error}</span>
            <button
              onClick={() => {
                setError(null);
                handleSendMessage(retryMessage);
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1 bg-red-100 rounded"
            >
              {language === 'vi' ? 'Thử lại' : 'Retry'}
            </button>
          </div>
        </div>
      )}
    </>
  );

  // If embedded, render full-screen chat without launcher button
  if (isEmbedded) {
    return (
      <>
        <Toaster />
        <div 
          className={`w-full h-full flex flex-col overflow-hidden
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          `}
        >
          {renderHeader()}

          {/* Messages Area */}
          <div 
            className={`flex-1 overflow-y-auto p-4 scrollbar-hide ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
            ref={scrollContainerRef}
          >
            {messages.map((msg, index) => renderMessage(msg, index))}
            
            {/* Suggested Questions */}
            {!isTyping && (messages.length === 1) && config.suggestedQuestions && config.suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 ml-10 animate-fade-in">
                {config.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:-translate-y-0.5
                    ${isDark 
                      ? 'bg-gray-800 border-gray-700 text-blue-300 hover:bg-gray-700' 
                      : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 hover:shadow-sm'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {renderInputArea()}
        </div>
      </>
    );
  }

  // Normal mode with floating button
  return (
    <>
      <Toaster />
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
        {isOpen && (
          <div 
            className={`pointer-events-auto w-[90vw] sm:w-[380px] h-[550px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden border animate-fade-in-up transition-all transform origin-bottom-right
            ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
            `}
          >
            {renderHeader()}

            {/* Messages Area */}
            <div 
              className={`flex-1 overflow-y-auto p-4 scrollbar-hide ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
              ref={scrollContainerRef}
            >
              {messages.map((msg, index) => renderMessage(msg, index))}
              
              {/* Suggested Questions */}
              {!isTyping && (messages.length === 1) && config.suggestedQuestions && config.suggestedQuestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 ml-10 animate-fade-in">
                  {config.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:-translate-y-0.5
                      ${isDark 
                        ? 'bg-gray-800 border-gray-700 text-blue-300 hover:bg-gray-700' 
                        : 'bg-white border-blue-100 text-blue-600 hover:bg-blue-50 hover:shadow-sm'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {renderInputArea()}
          </div>
        )}

        {/* Launcher */}
        <div className="relative pointer-events-auto group">
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md z-10 animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-4 rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
            style={{ backgroundColor: config.primaryColor }}
          >
            {isOpen ? <XIcon className="w-8 h-8" /> : <MessageCircleIcon className="w-8 h-8" />}
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;