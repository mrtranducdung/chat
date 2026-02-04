import { useState, useRef, useCallback, useEffect } from 'react';

type ResizeHandle = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface UseResizableOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  initialWidth?: number;
  initialHeight?: number;
}

export const useResizable = (options: UseResizableOptions = {}) => {
  const {
    minWidth = 300,
    minHeight = 220,
    maxWidth = 800,
    maxHeight = 800,
    initialWidth = 400,
    initialHeight = 500,
  } = options;

  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  const elementRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: initialWidth, height: initialHeight });
  const positionRef = useRef({ top: 0, left: 0 });
  const startRef = useRef({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0 });
  const handleTypeRef = useRef<ResizeHandle>('bottom-right');
  const rafIdRef = useRef<number | null>(null);

  const handleResizeStart = useCallback((handle: ResizeHandle) => 
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!elementRef.current) return;

      setIsResizing(true);
      handleTypeRef.current = handle;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = elementRef.current.getBoundingClientRect();

      startRef.current = {
        x: clientX,
        y: clientY,
        width: size.width,
        height: size.height,
        top: rect.top,
        left: rect.left,
      };

      sizeRef.current = { ...size };
      positionRef.current = { top: rect.top, left: rect.left };

      // Prevent text selection during resize
      document.body.style.userSelect = 'none';
      document.body.style.cursor = handle === 'bottom-right' || handle === 'top-left' 
        ? 'nwse-resize' 
        : 'nesw-resize';
    }, [size]);

  const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!elementRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const deltaX = clientX - startRef.current.x;
    const deltaY = clientY - startRef.current.y;

    let newWidth = startRef.current.width;
    let newHeight = startRef.current.height;
    let newTop = startRef.current.top;
    let newLeft = startRef.current.left;

    // Calculate new dimensions based on handle type
    switch (handleTypeRef.current) {
      case 'bottom-right':
        newWidth = startRef.current.width + deltaX;
        newHeight = startRef.current.height + deltaY;
        break;
      case 'bottom-left':
        newWidth = startRef.current.width - deltaX;
        newHeight = startRef.current.height + deltaY;
        newLeft = startRef.current.left + deltaX;
        break;
      case 'top-right':
        newWidth = startRef.current.width + deltaX;
        newHeight = startRef.current.height - deltaY;
        newTop = startRef.current.top + deltaY;
        break;
      case 'top-left':
        newWidth = startRef.current.width - deltaX;
        newHeight = startRef.current.height - deltaY;
        newTop = startRef.current.top + deltaY;
        newLeft = startRef.current.left + deltaX;
        break;
    }

    // Clamp to min/max
    const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

    // Adjust position if we hit min constraints (prevent jumping)
    if (handleTypeRef.current === 'top-right' || handleTypeRef.current === 'top-left') {
      if (newHeight < minHeight) {
        newTop = startRef.current.top + startRef.current.height - minHeight;
      } else if (newHeight > maxHeight) {
        newTop = startRef.current.top + startRef.current.height - maxHeight;
      }
    }

    if (handleTypeRef.current === 'bottom-left' || handleTypeRef.current === 'top-left') {
      if (newWidth < minWidth) {
        newLeft = startRef.current.left + startRef.current.width - minWidth;
      } else if (newWidth > maxWidth) {
        newLeft = startRef.current.left + startRef.current.width - maxWidth;
      }
    }

    // Update ref immediately
    sizeRef.current = { width: clampedWidth, height: clampedHeight };
    positionRef.current = { top: newTop, left: newLeft };

    // Cancel previous RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Schedule visual update with RAF
    rafIdRef.current = requestAnimationFrame(() => {
      if (elementRef.current) {
        elementRef.current.style.width = `${clampedWidth}px`;
        elementRef.current.style.height = `${clampedHeight}px`;
        
        // Update position for top/left handles
        if (handleTypeRef.current === 'top-right' || handleTypeRef.current === 'top-left') {
          elementRef.current.style.top = `${newTop}px`;
        }
        if (handleTypeRef.current === 'bottom-left' || handleTypeRef.current === 'top-left') {
          elementRef.current.style.left = `${newLeft}px`;
        }
      }
    });
  }, [minWidth, minHeight, maxWidth, maxHeight]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);

    // Restore cursor and selection
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    // Cancel any pending RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Persist final size and position to state
    setSize(sizeRef.current);
    setPosition(positionRef.current);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (e: MouseEvent | TouchEvent) => handleResizeMove(e);
    const handleEnd = () => handleResizeEnd();

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return {
    isResizing,
    size,
    position,
    elementRef,
    handleResizeStart,
  };
};