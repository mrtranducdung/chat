import React from 'react';

interface ResizeHandlesProps {
  isDark: boolean;
  onResizeStart: (handle: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => (e: React.MouseEvent | React.TouchEvent) => void;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ isDark, onResizeStart }) => {
  return (
    <>
      {/* Top-left resize handle */}
      <div
        onMouseDown={onResizeStart('top-left')}
        onTouchStart={onResizeStart('top-left')}
        className={`absolute top-0 left-0 w-5 h-5 cursor-nwse-resize z-[60] rounded-br transition-colors ${
          isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
        }`}
        style={{
          background: `linear-gradient(135deg, ${
            isDark ? '#6B7280' : '#9CA3AF'
          } 50%, transparent 50%)`,
        }}
      />
    </>
  );
};