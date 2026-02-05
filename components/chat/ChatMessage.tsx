import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageCircleIcon, UserIcon, ThumbsUpIcon, ThumbsDownIcon } from '../Icons';
import { Message, Sender, Language, Feedback } from '../../types';
import { TypingIndicator } from './TypingIndicator';

interface ChatMessageProps {
  message: Message;
  isTyping: boolean;
  isLastMessage: boolean;
  isDark: boolean;
  primaryColor: string;
  language: Language;
  enableFeedback: boolean;
  onFeedback: (messageId: string, text: string, type: Feedback) => void;
  onCopy: (text: string) => void;
  onRegenerate: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isTyping,
  isLastMessage,
  isDark,
  primaryColor,
  language,
  enableFeedback,
  onFeedback,
  onCopy,
  onRegenerate
}) => {
  // ✅ Helper to format similarity score
  const formatSimilarity = (score: number): string => {
    return (score * 100).toFixed(1) + '%';
  };

  return (
    <div className={`mb-3 sm:mb-4 flex flex-col ${message.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-end gap-1.5 sm:gap-2 max-w-[90%] sm:max-w-[85%] ${message.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'}`}>
        <div 
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
            message.sender === Sender.USER 
              ? (isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-500')
              : (isDark ? 'bg-gray-800 border-gray-700 text-blue-400' : 'bg-white border-blue-100 text-blue-600')
          }`}
          style={message.sender === Sender.BOT && !isDark ? { color: primaryColor } : {}}
        >
          {message.sender === Sender.USER ? <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <MessageCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>

        <div
          className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm prose prose-sm sm:prose relative group ${
            message.sender === Sender.USER
              ? 'bg-blue-600 text-white rounded-tr-none'
              : (isDark ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none')
          }`}
          style={message.sender === Sender.USER ? { backgroundColor: primaryColor } : {}}
        >
          {message.sender === Sender.BOT && isTyping && isLastMessage && message.text === "" 
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
                        customStyle={{ fontSize: '0.75rem', margin: '0.5rem 0' }}
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
                {message.text}
              </ReactMarkdown>
            )
          }
          
          {/* ✅ RAG INDICATOR - Shows when bot used knowledge base */}
          {message.sender === Sender.BOT && message.ragUsed && message.text !== "" && (
            <div 
              className={`mt-2 pt-2 border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              } flex items-center gap-2 text-[10px] group/rag relative`}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-sm" role="img" aria-label="brain">🧠</span>
                <span className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {language === 'vi' ? 'Từ kiến thức nội bộ' : 'From knowledge base'}
                </span>
              </span>
              
              {/* Tooltip with details */}
              <div className={`
                hidden group-hover/rag:block absolute bottom-full left-0 mb-2 
                px-2 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-10
                ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-800 text-white'}
              `}>
                <div className="text-[9px] space-y-0.5">
                  <div>📊 {language === 'vi' ? 'Độ liên quan' : 'Relevance'}: <span className="font-bold text-green-400">{formatSimilarity(message.ragSimilarity || 0)}</span></div>
                  <div>📚 {language === 'vi' ? 'Nguồn' : 'Sources'}: <span className="font-bold">{message.ragChunks || 0} {language === 'vi' ? 'đoạn' : 'chunks'}</span></div>
                </div>
                {/* Arrow */}
                <div className={`absolute top-full left-3 -mt-1 w-2 h-2 rotate-45 ${isDark ? 'bg-gray-700' : 'bg-gray-800'}`}></div>
              </div>
            </div>
          )}
          
          {/* Timestamp on hover */}
          {message.text && (
            <div className="hidden sm:block absolute -bottom-5 left-0 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {new Date(message.timestamp).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {enableFeedback && message.sender === Sender.BOT && message.id !== 'welcome' && message.text !== "" && (
        <div className={`flex gap-1 mt-1 ml-8 sm:ml-10 transition-opacity duration-300 ${isTyping && isLastMessage ? 'opacity-0' : 'opacity-100'}`}>
          <button 
            onClick={() => onFeedback(message.id, message.text, 'up')} 
            className={`p-1.5 sm:p-1 hover:bg-gray-100/10 rounded transition-colors ${message.feedback === 'up' ? 'text-green-600' : 'text-gray-400'}`}
            title={language === 'vi' ? 'Hữu ích' : 'Helpful'}
          >
            <ThumbsUpIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
          <button 
            onClick={() => onFeedback(message.id, message.text, 'down')} 
            className={`p-1.5 sm:p-1 hover:bg-gray-100/10 rounded transition-colors ${message.feedback === 'down' ? 'text-red-600' : 'text-gray-400'}`}
            title={language === 'vi' ? 'Không hữu ích' : 'Not helpful'}
          >
            <ThumbsDownIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
          <button 
            onClick={() => onCopy(message.text)}
            className="p-1.5 sm:p-1 hover:bg-gray-100/10 rounded transition-colors text-gray-400 hover:text-blue-600 text-sm"
            title={language === 'vi' ? 'Sao chép' : 'Copy'}
          >
            📋
          </button>
          <button 
            onClick={() => onRegenerate(message.id)}
            className="p-1.5 sm:p-1 hover:bg-gray-100/10 rounded transition-colors text-gray-400 hover:text-purple-600 text-sm"
            title={language === 'vi' ? 'Tạo lại câu trả lời' : 'Regenerate'}
          >
            🔄
          </button>
        </div>
      )}
    </div>
  );
};