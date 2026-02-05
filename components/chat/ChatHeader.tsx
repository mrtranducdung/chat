import React, { useState, useEffect } from 'react';
import { XIcon } from '../Icons';
import { Language } from '../../types';
import { getKnowledgeStats } from '../../services/storageService';

interface ChatHeaderProps {
  botName: string;
  primaryColor: string;
  isOnline: boolean;
  language: Language;
  isLangMenuOpen: boolean;
  setIsLangMenuOpen: (open: boolean) => void;
  setLanguage: (lang: Language) => void;
  onNewConversation: () => void;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  isDark: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  botName,
  primaryColor,
  isOnline,
  language,
  isLangMenuOpen,
  setIsLangMenuOpen,
  setLanguage,
  onNewConversation,
  onDragStart,
  isDark
}) => {
  // ✅ Knowledge base stats state
  const [knowledgeStats, setKnowledgeStats] = useState<{
    totalDocuments: number;
    totalChunks: number;
    hasDocuments: boolean;
  } | null>(null);

  // ✅ Load knowledge stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getKnowledgeStats();
        setKnowledgeStats(stats);
      } catch (error) {
        console.warn('Failed to load knowledge stats:', error);
      }
    };
    
    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="p-3 sm:p-4 text-white flex justify-between items-center shadow-md relative z-10 cursor-move touch-none select-none"
      style={{ backgroundColor: primaryColor }}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'} border-2 border-white/20`}></div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base leading-tight">{botName}</h3>
            
            {/* ✅ KNOWLEDGE BASE BADGE */}
            {knowledgeStats && knowledgeStats.hasDocuments && (
              <div 
                className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full group/badge relative"
                title={language === 'vi' 
                  ? `${knowledgeStats.totalDocuments} tài liệu, ${knowledgeStats.totalChunks} đoạn văn` 
                  : `${knowledgeStats.totalDocuments} documents, ${knowledgeStats.totalChunks} chunks`
                }
              >
                <span className="text-[10px]">🧠</span>
                <span className="text-[9px] font-bold hidden sm:inline">{knowledgeStats.totalDocuments}</span>
                
                {/* Tooltip on hover */}
                <div className="hidden group-hover/badge:block absolute top-full left-0 mt-2 bg-gray-900 text-white text-[10px] px-2 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-20">
                  <div className="space-y-0.5">
                    <div>📚 {knowledgeStats.totalDocuments} {language === 'vi' ? 'tài liệu' : 'documents'}</div>
                    <div>✂️ {knowledgeStats.totalChunks} {language === 'vi' ? 'đoạn văn' : 'chunks'}</div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute bottom-full left-3 mb-[-4px] w-2 h-2 rotate-45 bg-gray-900"></div>
                </div>
              </div>
            )}
          </div>
          
          <span className="text-[9px] sm:text-[10px] opacity-80 uppercase tracking-wider">
            {isOnline ? (language === 'vi' ? 'Trực tuyến' : 'Online') : (language === 'vi' ? 'Ngoại tuyến' : 'Offline')}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
        {/* New Chat Button */}
        <button 
          onClick={onNewConversation}
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all text-sm"
          title={language === 'vi' ? 'Cuộc trò chuyện mới' : 'New conversation'}
        >
          🔄
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded transition-colors text-white font-medium"
          >
            {language === 'vi' ? '🇻🇳' : '🇺🇸'}
            <span className="hidden sm:inline">{language === 'vi' ? ' VI' : ' EN'}</span>
          </button>
          
          {isLangMenuOpen && (
            <>
              <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsLangMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-32 sm:w-24 bg-white rounded-lg shadow-xl py-1 z-20 overflow-hidden animate-fade-in text-gray-800">
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

      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute top-full left-0 right-0 bg-red-500 text-white text-[10px] sm:text-xs py-1 px-4 text-center pointer-events-none">
          {language === 'vi' ? '⚠️ Không có kết nối' : '⚠️ No connection'}
        </div>
      )}
    </div>
  );
};