import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { XIcon, MessageCircleIcon } from '../Icons';
import { ChatWidgetProps } from '../../types';
import { useChatLogic } from './useChatLogic';
import { useDraggable } from './useDraggable';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestedQuestions } from './SuggestedQuestions';

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
  const isDark = config.theme === 'dark';

  // dynamic height for normal mode
  const headerWrapRef = useRef<HTMLDivElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState<number>(220);

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

  useLayoutEffect(() => {
    if (!chat.isOpen || isEmbedded) return;

    const headerEl = headerWrapRef.current;
    const inputEl = inputWrapRef.current;
    const scrollEl = chat.scrollContainerRef.current;

    if (!headerEl || !inputEl || !scrollEl) return;

    const headerH = headerEl.getBoundingClientRect().height || 0;
    const inputH = inputEl.getBoundingClientRect().height || 0;
    const contentH = scrollEl.scrollHeight || 0;

    const buffer = 24;
    const min = 220;
    const max = Math.min(window.innerHeight * 0.6, 600);
    const desired = headerH + inputH + Math.min(contentH, 420) + buffer;

    setDynamicHeight(Math.max(min, Math.min(desired, max)));
  }, [chat.isOpen, chat.messages.length, chat.isTyping, isEmbedded]);

  // Embedded mode (kept for compatibility but not used with new approach)
  if (isEmbedded) {
    return (
      <>
        <Toaster />
        {chat.isOpen && (
          <div
            className={`w-full h-full flex flex-col overflow-hidden ${
              isDark ? 'bg-gray-900' : 'bg-white'
            }`}
            style={{ position: 'relative' }}
          >
            <ChatHeader
              botName={config.botName}
              primaryColor={config.primaryColor}
              isOnline={chat.isOnline}
              language={chat.language}
              isLangMenuOpen={chat.isLangMenuOpen}
              setIsLangMenuOpen={chat.setIsLangMenuOpen}
              setLanguage={chat.setLanguage}
              onNewConversation={chat.startNewConversation}
              onDragStart={undefined as any}
              isDark={isDark}
            />

            <div
              ref={chat.scrollContainerRef}
              className={`flex-1 overflow-y-auto p-3 sm:p-4 ${
                isDark ? 'bg-gray-900' : 'bg-gray-50'
              }`}
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y',
              }}
            >
              {chat.messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isTyping={chat.isTyping}
                  isLastMessage={index === chat.messages.length - 1}
                  isDark={isDark}
                  primaryColor={config.primaryColor}
                  language={chat.language}
                  enableFeedback={config.enableFeedback}
                  onFeedback={chat.handleFeedback}
                  onCopy={chat.copyToClipboard}
                  onRegenerate={chat.regenerateResponse}
                />
              ))}

              {!chat.isTyping && chat.messages.length === 1 && (
                <SuggestedQuestions
                  questions={config.suggestedQuestions || []}
                  onSelect={chat.handleSendMessage}
                  isDark={isDark}
                />
              )}

              <div ref={chat.messagesEndRef} />
            </div>

            <ChatInput
              value={chat.inputValue}
              onChange={chat.setInputValue}
              onSend={() => chat.handleSendMessage()}
              onKeyDown={chat.handleKeyDown}
              disabled={!chat.isOnline}
              isTyping={chat.isTyping}
              primaryColor={config.primaryColor}
              language={chat.language}
              isDark={isDark}
              error={chat.error}
              retryMessage={chat.retryMessage}
              onRetry={chat.handleRetry}
            />
          </div>
        )}
      </>
    );
  }

  // If externally controlled, don't render the button
  if (externalControl) {
    return (
      <>
        <Toaster />

        {chat.isOpen && (
            <div
              ref={drag.elementRef}
              className={`fixed rounded-2xl shadow-2xl flex flex-col overflow-hidden border z-50 ${
                isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`}
              style={{
                width: 'min(400px, 50vw)',
                height: `${dynamicHeight}px`,
                maxHeight: 'min(600px, 60vh)',
                minHeight: '220px',
                right: drag.position.x === 0 ? '20px' : 'auto',
                bottom: drag.position.y === 0 ? '90px' : 'auto',
                left: drag.position.x !== 0 ? `${drag.position.x}px` : 'auto',
                top: drag.position.y !== 0 ? `${drag.position.y}px` : 'auto',
                resize: 'both',
                overflow: 'hidden',
                pointerEvents: 'auto', // ADD THIS LINE - chat window captures clicks
              }}
            >
            <div ref={headerWrapRef}>
              <ChatHeader
                botName={config.botName}
                primaryColor={config.primaryColor}
                isOnline={chat.isOnline}
                language={chat.language}
                isLangMenuOpen={chat.isLangMenuOpen}
                setIsLangMenuOpen={chat.setIsLangMenuOpen}
                setLanguage={chat.setLanguage}
                onNewConversation={chat.startNewConversation}
                onDragStart={drag.handleDragStart}
                isDark={isDark}
              />
            </div>

            <div
              ref={chat.scrollContainerRef}
              className={`flex-1 overflow-y-auto p-3 sm:p-4 ${
                isDark ? 'bg-gray-900' : 'bg-gray-50'
              }`}
            >
              {chat.messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isTyping={chat.isTyping}
                  isLastMessage={index === chat.messages.length - 1}
                  isDark={isDark}
                  primaryColor={config.primaryColor}
                  language={chat.language}
                  enableFeedback={config.enableFeedback}
                  onFeedback={chat.handleFeedback}
                  onCopy={chat.copyToClipboard}
                  onRegenerate={chat.regenerateResponse}
                />
              ))}

              {!chat.isTyping && chat.messages.length === 1 && (
                <SuggestedQuestions
                  questions={config.suggestedQuestions || []}
                  onSelect={chat.handleSendMessage}
                  isDark={isDark}
                />
              )}

              <div ref={chat.messagesEndRef} />
            </div>

            <div ref={inputWrapRef}>
              <ChatInput
                value={chat.inputValue}
                onChange={chat.setInputValue}
                onSend={() => chat.handleSendMessage()}
                onKeyDown={chat.handleKeyDown}
                disabled={!chat.isOnline}
                isTyping={chat.isTyping}
                primaryColor={config.primaryColor}
                language={chat.language}
                isDark={isDark}
                error={chat.error}
                retryMessage={chat.retryMessage}
                onRetry={chat.handleRetry}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Normal mode (frontend) — keep your working behavior + resizable + auto-grow
  return (
    <>
      <Toaster />

      {chat.isOpen && (
        <div
          ref={drag.elementRef}
          className={`fixed rounded-2xl shadow-2xl flex flex-col overflow-hidden border z-50 ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}
          style={{
            width: 'min(400px, 50vw)',
            height: `${dynamicHeight}px`,
            maxHeight: 'min(600px, 60vh)',
            minHeight: '220px',
            right: drag.position.x === 0 ? '20px' : 'auto',
            bottom: drag.position.y === 0 ? '90px' : 'auto',
            left: drag.position.x !== 0 ? `${drag.position.x}px` : 'auto',
            top: drag.position.y !== 0 ? `${drag.position.y}px` : 'auto',
            resize: 'both',
            overflow: 'hidden',
          }}
        >
          <div ref={headerWrapRef}>
            <ChatHeader
              botName={config.botName}
              primaryColor={config.primaryColor}
              isOnline={chat.isOnline}
              language={chat.language}
              isLangMenuOpen={chat.isLangMenuOpen}
              setIsLangMenuOpen={chat.setIsLangMenuOpen}
              setLanguage={chat.setLanguage}
              onNewConversation={chat.startNewConversation}
              onDragStart={drag.handleDragStart}
              isDark={isDark}
            />
          </div>

          <div
            ref={chat.scrollContainerRef}
            className={`flex-1 overflow-y-auto p-3 sm:p-4 ${
              isDark ? 'bg-gray-900' : 'bg-gray-50'
            }`}
          >
            {chat.messages.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isTyping={chat.isTyping}
                isLastMessage={index === chat.messages.length - 1}
                isDark={isDark}
                primaryColor={config.primaryColor}
                language={chat.language}
                enableFeedback={config.enableFeedback}
                onFeedback={chat.handleFeedback}
                onCopy={chat.copyToClipboard}
                onRegenerate={chat.regenerateResponse}
              />
            ))}

            {!chat.isTyping && chat.messages.length === 1 && (
              <SuggestedQuestions
                questions={config.suggestedQuestions || []}
                onSelect={chat.handleSendMessage}
                isDark={isDark}
              />
            )}

            <div ref={chat.messagesEndRef} />
          </div>

          <div ref={inputWrapRef}>
            <ChatInput
              value={chat.inputValue}
              onChange={chat.setInputValue}
              onSend={() => chat.handleSendMessage()}
              onKeyDown={chat.handleKeyDown}
              disabled={!chat.isOnline}
              isTyping={chat.isTyping}
              primaryColor={config.primaryColor}
              language={chat.language}
              isDark={isDark}
              error={chat.error}
              retryMessage={chat.retryMessage}
              onRetry={chat.handleRetry}
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50">
        {chat.unreadCount > 0 && !chat.isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md z-10 animate-bounce">
            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
          </span>
        )}
        <button
          onClick={() => chat.setIsOpen(!chat.isOpen)}
          className="p-3 sm:p-4 rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-content-center"
          style={{ backgroundColor: config.primaryColor }}
          aria-label={chat.isOpen ? 'Close chat' : 'Open chat'}
          type="button"
        >
          {chat.isOpen ? (
            <XIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          ) : (
            <MessageCircleIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          )}
        </button>
      </div>
    </>
  );
};

export default ChatWidget;