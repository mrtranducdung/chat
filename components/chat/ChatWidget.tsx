import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ChatWidgetProps } from '../../types';
import { useChatLogic } from './useChatLogic';
import { useDraggable } from './useDraggable';
import { useResizable } from './useResizable';
import { ChatWindowEmbedded } from './ChatWindowEmbedded';
import { ChatWindowFloating } from './ChatWindowFloating';
import { FloatingButton } from './FloatingButton';

interface ExtendedChatWidgetProps extends ChatWidgetProps {
  externalControl?: boolean;
  forceOpen?: boolean;
}

const ChatWidget: React.FC<ExtendedChatWidgetProps> = ({ 
  config, 
  isEmbedded = false,
  externalControl = false,
  forceOpen = false
}) => {
  const chat = useChatLogic(config, isEmbedded);
  const drag = useDraggable();
  const resize = useResizable({ 
    minWidth: 300, 
    minHeight: 220, 
    maxWidth: 600, 
    maxHeight: 800,
    initialWidth: 400,
    initialHeight: 500,
  });
  const isDark = config.theme === 'dark';

  // Sync external control (when button is outside iframe)
  useEffect(() => {
    if (externalControl) {
      chat.setIsOpen(forceOpen);
    }
  }, [externalControl, forceOpen, chat]);

  // Notify parent when chat closes (for external control)
  useEffect(() => {
    if (externalControl && !chat.isOpen && window.parent) {
      window.parent.postMessage('GEMINIBOT_CLOSE', '*');
    }
  }, [externalControl, chat.isOpen]);

  // ========== EMBEDDED MODE ==========
  if (isEmbedded) {
    return (
      <>
        <Toaster />
        <ChatWindowEmbedded
          config={config}
          isDark={isDark}
          isOpen={chat.isOpen}
          chat={chat}
        />
      </>
    );
  }

  // ========== EXTERNAL CONTROL MODE ==========
  if (externalControl) {
    return (
      <>
        <Toaster />
        <ChatWindowFloating
          config={config}
          isDark={isDark}
          isOpen={chat.isOpen}
          chat={chat}
          drag={drag}
          resize={resize}
          externalControl={true}
        />
      </>
    );
  }

  // ========== NORMAL MODE ==========
  return (
    <>
      <Toaster />
      
      <ChatWindowFloating
        config={config}
        isDark={isDark}
        isOpen={chat.isOpen}
        chat={chat}
        drag={drag}
        resize={resize}
      />

      <FloatingButton
        isOpen={chat.isOpen}
        unreadCount={chat.unreadCount}
        primaryColor={config.primaryColor}
        onToggle={() => chat.setIsOpen(!chat.isOpen)}
      />
    </>
  );
};

export default ChatWidget;