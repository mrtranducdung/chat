import React from 'react';
import { ChatWindowBase } from './ChatWindowBase';
import { AppConfig } from '../../types';
import { UseChatLogicReturn } from './chatTypes';

interface ChatWindowEmbeddedProps {
  config: AppConfig;
  isDark: boolean;
  isOpen: boolean;
  chat: UseChatLogicReturn;
}

export const ChatWindowEmbedded: React.FC<ChatWindowEmbeddedProps> = ({
  config,
  isDark,
  isOpen,
  chat,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}
      style={{ position: 'relative' }}
    >
      <ChatWindowBase
        config={config}
        isDark={isDark}
        chat={chat}
        onDragStart={undefined as any}
      />
    </div>
  );
};