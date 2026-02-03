import React from 'react';
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

  // Embedded mode (inside iframe): NO red close button.
  // Host page (embed.js) controls open/close via its own button + postMessage close.
// If embedded, render chat to FILL the iframe (no floating, no draggable offsets)
  if (isEmbedded) {
    return (
      <>
        <Toaster />

        {chat.isOpen && (
          <div
            ref={drag.elementRef}
            className={`w-full h-full flex flex-col overflow-hidden
              ${isDark ? 'bg-gray-900' : 'bg-white'}
            `}
            style={{
              // IMPORTANT: embed should fill iframe, NOT be fixed popup
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
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
              // Optional: disable drag in embed by NOT passing onDragStart
              onDragStart={undefined as any}
              isDark={isDark}
            />

            <div
              className={`flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-hide ${
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


  // Normal mode: remove the red close button and only use the blue launcher button.
  return (
    <>
      <Toaster />

      {chat.isOpen && (
        <div
          ref={drag.elementRef}
          className={`fixed rounded-2xl shadow-2xl flex flex-col overflow-hidden border z-50
            ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
          `}
          style={{
            width: 'min(400px, 50vw)',
            height: 'min(600px, 60vh)',
            right: drag.position.x === 0 ? '20px' : 'auto',
            bottom: drag.position.y === 0 ? '90px' : 'auto',
            left: drag.position.x !== 0 ? `${drag.position.x}px` : 'auto',
            top: drag.position.y !== 0 ? `${drag.position.y}px` : 'auto',
          }}
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
            onDragStart={drag.handleDragStart}
            isDark={isDark}
          />

          <div
            className={`flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-hide ${
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
