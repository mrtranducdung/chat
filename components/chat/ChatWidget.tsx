import React, { useLayoutEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { XIcon, MessageCircleIcon } from '../Icons';
import { ChatWidgetProps } from '../../types';
import { useChatLogic } from './useChatLogic';
import { useDraggable } from './useDraggable';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestedQuestions } from './SuggestedQuestions';

const ChatWidget: React.FC<ChatWidgetProps> = ({ config, isEmbedded = false }) => {
  const chat = useChatLogic(config, isEmbedded);
  const drag = useDraggable();
  const isDark = config.theme === 'dark';

  // Refs to measure for auto-growing height
  const containerRef = useRef<HTMLDivElement>(null);
  const headerWrapRef = useRef<HTMLDivElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);

  // Dynamic height for normal mode (and optional embedded)
  const [dynamicHeight, setDynamicHeight] = useState<number>(220);

  // Auto-grow height as content grows (starts compact)
  useLayoutEffect(() => {
    if (!chat.isOpen) return;

    const headerEl = headerWrapRef.current;
    const inputEl = inputWrapRef.current;
    const scrollEl = chat.scrollContainerRef.current;

    if (!headerEl || !inputEl || !scrollEl) return;

    const headerH = headerEl.getBoundingClientRect().height || 0;
    const inputH = inputEl.getBoundingClientRect().height || 0;

    // scrollHeight is total content height inside messages area
    const contentH = scrollEl.scrollHeight || 0;

    // Buffer for paddings/borders
    const buffer = 24;

    // Start small, grow with content, but cap by max
    const min = 220;
    const max = Math.min(window.innerHeight * 0.6, 600);

    // Let messages area contribute gradually (cap how much of content drives size)
    const desired = headerH + inputH + Math.min(contentH, 420) + buffer;

    setDynamicHeight(Math.max(min, Math.min(desired, max)));
  }, [chat.isOpen, chat.messages.length, chat.isTyping]);

  // Helper to set both refs cleanly
  const setContainerNode = (node: HTMLDivElement | null) => {
    drag.elementRef.current = node;
    containerRef.current = node;
  };

  // Embedded: fill iframe, no launcher button, no red X
  if (isEmbedded) {
    return (
      <>
        <Toaster />
        {chat.isOpen && (
          <div
            ref={setContainerNode}
            className={`w-full h-full flex flex-col overflow-hidden ${
              isDark ? 'bg-gray-900' : 'bg-white'
            }`}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              // Optional: allow resizing even inside iframe (usually not needed)
              // resize: 'both',
              // overflow: 'hidden',
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
                // No dragging in embed
                onDragStart={undefined as any}
                isDark={isDark}
              />
            </div>

            <div
              className={`flex-1 overflow-y-auto p-3 sm:p-4 ${
                isDark ? 'bg-gray-900' : 'bg-gray-50'
              }`}
              ref={chat.scrollContainerRef}
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

  // Normal mode
  return (
    <>
      <Toaster />

      {chat.isOpen && (
        <div
          ref={setContainerNode}
          className={`fixed rounded-2xl shadow-2xl flex flex-col overflow-hidden border z-50 ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}
          style={{
            width: 'min(400px, 50vw)',

            // Auto-growing height (starts compact)
            height: `${dynamicHeight}px`,
            maxHeight: 'min(600px, 60vh)',
            minHeight: '220px',

            right: drag.position.x === 0 ? '20px' : 'auto',
            bottom: drag.position.y === 0 ? '90px' : 'auto',
            left: drag.position.x !== 0 ? `${drag.position.x}px` : 'auto',
            top: drag.position.y !== 0 ? `${drag.position.y}px` : 'auto',

            // User can resize the frame
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
            className={`flex-1 overflow-y-auto p-3 sm:p-4 ${
              isDark ? 'bg-gray-900' : 'bg-gray-50'
            }`}
            ref={chat.scrollContainerRef}
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

      {/* Launcher Button (blue) */}
      <div className="fixed bottom-4 right-4 z-50">
        {chat.unreadCount > 0 && !chat.isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md z-10 animate-bounce">
            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
          </span>
        )}

        <button
          onClick={() => chat.setIsOpen(!chat.isOpen)}
          className="p-3 sm:p-4 rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
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
