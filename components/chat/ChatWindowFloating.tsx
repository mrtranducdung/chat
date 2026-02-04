import React, { useLayoutEffect, useRef, useState } from 'react';
import { ChatWindowBase } from './ChatWindowBase';
import { ResizeHandles } from './ResizeHandles';
import { AppConfig } from '../../types';
import { UseChatLogicReturn, UseDraggableReturn, UseResizableReturn } from './chatTypes';

interface ChatWindowFloatingProps {
  config: AppConfig;
  isDark: boolean;
  isOpen: boolean;
  chat: UseChatLogicReturn;
  drag: UseDraggableReturn;
  resize: UseResizableReturn;
  externalControl?: boolean;
}

export const ChatWindowFloating: React.FC<ChatWindowFloatingProps> = ({
  config,
  isDark,
  isOpen,
  chat,
  drag,
  resize,
  externalControl = false,
}) => {
  const headerWrapRef = useRef<HTMLDivElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);

  // Dynamic height calculation (optional, currently using fixed resize)
  useLayoutEffect(() => {
    if (!isOpen) return;

    const headerEl = headerWrapRef.current;
    const inputEl = inputWrapRef.current;
    const scrollEl = chat.scrollContainerRef.current;

    if (!headerEl || !inputEl || !scrollEl) return;

    // You can use this for auto-height calculations if needed
    // Currently the resize hook controls the height
  }, [isOpen, chat.messages.length, chat.isTyping]);

  if (!isOpen) return null;

  // Calculate final position
  // If dragged (position is set), use absolute positioning, otherwise use default bottom-right
  const isDragged = drag.position.x !== 0 || drag.position.y !== 0;

  return (
    <div
      ref={(el) => {
        drag.elementRef.current = el;
        resize.elementRef.current = el;
      }}
      className={`fixed rounded-2xl shadow-2xl flex flex-col overflow-hidden border z-50 ${
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
      style={{
        width: `${resize.size.width}px`,
        height: `${resize.size.height}px`,
        ...(isDragged 
          ? {
              left: `${drag.position.x}px`,
              top: `${drag.position.y}px`,
              right: 'auto',
              bottom: 'auto',
            }
          : {
              right: '20px',
              bottom: '90px',
              left: 'auto',
              top: 'auto',
            }
        ),
        pointerEvents: externalControl ? 'auto' : undefined,
      }}
    >
      {/* Resize handles */}
      <ResizeHandles isDark={isDark} onResizeStart={resize.handleResizeStart} />

      {/* Chat content */}
      <ChatWindowBase
        config={config}
        isDark={isDark}
        chat={chat}
        headerWrapRef={headerWrapRef}
        inputWrapRef={inputWrapRef}
        onDragStart={drag.handleDragStart}
      />
    </div>
  );
};