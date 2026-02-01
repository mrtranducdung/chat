import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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
  const [isOpen, setIsOpen] = useState(isEmbedded); // Auto-open if embedded
  const [language, setLanguage] = useState<Language>(config.defaultLanguage || 'vi');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
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
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue.trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: Sender.USER,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    
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
      setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, text: "Error connection." } : msg));
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

  // If embedded, render full-screen chat without launcher button
  if (isEmbedded) {
    return (
      <div 
        className={`w-full h-full flex flex-col overflow-hidden
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        `}
      >
        {/* Header */}
        <div 
          className="p-4 text-white flex justify-between items-center shadow-md relative z-10"
          style={{ backgroundColor: config.primaryColor }}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse border-2 border-white/20"></div>
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-base leading-tight">{config.botName}</h3>
              <span className="text-[10px] opacity-80 uppercase tracking-wider">Online</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
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
          </div>
        </div>

        {/* Messages Area */}
        <div 
          className={`flex-1 overflow-y-auto p-4 scrollbar-hide ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
          ref={scrollContainerRef}
        >
          {messages.map((msg, index) => (
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
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm prose ${
                    msg.sender === Sender.USER
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : (isDark ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none')
                  }`}
                  style={msg.sender === Sender.USER ? { backgroundColor: config.primaryColor } : {}}
                >
                  {msg.sender === Sender.BOT && isTyping && msg.id === messages[messages.length-1].id && msg.text === "" 
                    ? <TypingIndicator />
                    : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                </div>
              </div>

              {config.enableFeedback && msg.sender === Sender.BOT && msg.id !== 'welcome' && msg.text !== "" && (
                <div className={`flex gap-1 mt-1 ml-10 transition-opacity duration-300 ${isTyping && index === messages.length - 1 ? 'opacity-0' : 'opacity-100'}`}>
                  <button 
                    onClick={() => handleFeedback(msg.id, msg.text, 'up')} 
                    className={`p-1 hover:bg-gray-100/10 rounded transition-colors ${msg.feedback === 'up' ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <ThumbsUpIcon className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleFeedback(msg.id, msg.text, 'down')} 
                    className={`p-1 hover:bg-gray-100/10 rounded transition-colors ${msg.feedback === 'down' ? 'text-red-600' : 'text-gray-400'}`}
                  >
                    <ThumbsDownIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
          
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

        {/* Input Area */}
        <div className={`p-4 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={UI_STRINGS[language].placeholder}
              className={`w-full rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm
              ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-800'}
              `}
              style={{ '--tw-ring-color': config.primaryColor } as React.CSSProperties}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 p-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              style={{ backgroundColor: config.primaryColor }}
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">{UI_STRINGS[language].poweredBy}</span>
          </div>
        </div>
      </div>
    );
  }

  // Normal mode with floating button
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div 
          className={`pointer-events-auto w-[90vw] sm:w-[380px] h-[550px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden border animate-fade-in-up transition-all transform origin-bottom-right
          ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
          `}
        >
          {/* Header */}
          <div 
            className="p-4 text-white flex justify-between items-center shadow-md relative z-10"
            style={{ backgroundColor: config.primaryColor }}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse border-2 border-white/20"></div>
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-base leading-tight">{config.botName}</h3>
                <span className="text-[10px] opacity-80 uppercase tracking-wider">Online</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
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

              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            className={`flex-1 overflow-y-auto p-4 scrollbar-hide ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
            ref={scrollContainerRef}
          >
            {messages.map((msg, index) => (
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
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm prose ${
                      msg.sender === Sender.USER
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : (isDark ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none')
                    }`}
                    style={msg.sender === Sender.USER ? { backgroundColor: config.primaryColor } : {}}
                  >
                    {msg.sender === Sender.BOT && isTyping && msg.id === messages[messages.length-1].id && msg.text === "" 
                      ? <TypingIndicator />
                      : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                  </div>
                </div>

                {config.enableFeedback && msg.sender === Sender.BOT && msg.id !== 'welcome' && msg.text !== "" && (
                  <div className={`flex gap-1 mt-1 ml-10 transition-opacity duration-300 ${isTyping && index === messages.length - 1 ? 'opacity-0' : 'opacity-100'}`}>
                    <button 
                      onClick={() => handleFeedback(msg.id, msg.text, 'up')} 
                      className={`p-1 hover:bg-gray-100/10 rounded transition-colors ${msg.feedback === 'up' ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      <ThumbsUpIcon className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleFeedback(msg.id, msg.text, 'down')} 
                      className={`p-1 hover:bg-gray-100/10 rounded transition-colors ${msg.feedback === 'down' ? 'text-red-600' : 'text-gray-400'}`}
                    >
                      <ThumbsDownIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
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

          {/* Input Area */}
          <div className={`p-4 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={UI_STRINGS[language].placeholder}
                className={`w-full rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm
                ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-800'}
                `}
                style={{ '--tw-ring-color': config.primaryColor } as React.CSSProperties}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 p-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                style={{ backgroundColor: config.primaryColor }}
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400">{UI_STRINGS[language].poweredBy}</span>
            </div>
          </div>
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
  );
};

export default ChatWidget;