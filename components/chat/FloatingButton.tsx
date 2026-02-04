import React from 'react';
import { XIcon, MessageCircleIcon } from '../Icons';

interface FloatingButtonProps {
  isOpen: boolean;
  unreadCount: number;
  primaryColor: string;
  onToggle: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  isOpen,
  unreadCount,
  primaryColor,
  onToggle,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Unread badge */}
      {unreadCount > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md z-10 animate-bounce">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="p-3 sm:p-4 rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        type="button"
      >
        {isOpen ? (
          <XIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        ) : (
          <MessageCircleIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        )}
      </button>
    </div>
  );
};