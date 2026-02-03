import React from 'react';
import { SendIcon } from '../Icons';
import { Language, UI_STRINGS } from '../../types';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
  isTyping: boolean;
  primaryColor: string;
  language: Language;
  isDark: boolean;
  error: string | null;
  retryMessage: string | null;
  onRetry: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
  isTyping,
  primaryColor,
  language,
  isDark,
  error,
  retryMessage,
  onRetry
}) => {
  return (
    <>
      <div className={`p-3 sm:p-4 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={UI_STRINGS[language].placeholder}
            maxLength={2000}
            disabled={disabled}
            className={`w-full rounded-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-xs sm:text-sm
            ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-800'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          />
          <button
            onClick={onSend}
            disabled={!value.trim() || isTyping || disabled}
            className="absolute right-1.5 sm:right-2 p-1.5 sm:p-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            <SendIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-gray-400 mt-1.5 sm:mt-2">
          <span>{UI_STRINGS[language].poweredBy}</span>
          {value && (
            <span className={value.length > 1500 ? 'text-red-500' : ''}>
              {value.length}/2000
            </span>
          )}
        </div>
      </div>

      {/* Error retry UI */}
      {error && retryMessage && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-red-700">{error}</span>
            <button
              onClick={onRetry}
              className="text-[10px] sm:text-xs text-red-600 hover:text-red-700 font-medium px-2 sm:px-3 py-1 bg-red-100 rounded"
            >
              {language === 'vi' ? 'Thử lại' : 'Retry'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};