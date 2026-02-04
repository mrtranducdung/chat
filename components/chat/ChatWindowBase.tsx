import React from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SuggestedQuestions } from './SuggestedQuestions';
import { AppConfig } from '../../types';
import { UseChatLogicReturn } from './chatTypes';

interface ChatWindowBaseProps {
  config: AppConfig;
  isDark: boolean;
  chat: UseChatLogicReturn;
  headerWrapRef?: React.RefObject<HTMLDivElement>;
  inputWrapRef?: React.RefObject<HTMLDivElement>;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const ChatWindowBase: React.FC<ChatWindowBaseProps> = ({
  config,
  isDark,
  chat,
  headerWrapRef,
  inputWrapRef,
  onDragStart,
}) => {
  return (
    <>
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
          onDragStart={onDragStart}
          isDark={isDark}
        />
      </div>

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
            onFeedback={(messageId, feedback) => chat.handleFeedback(messageId, msg.text, feedback as any)}
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
    </>
  );
};