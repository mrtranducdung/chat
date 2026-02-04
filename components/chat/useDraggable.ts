import { useState, useEffect, useRef, useCallback } from 'react';

export const useDraggable = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Live position tracking (no re-renders)
  const positionRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const boundariesRef = useRef({ maxX: 0, maxY: 0 });
  const rafIdRef = useRef<number | null>(null);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!elementRef.current) return;

    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Get current position from the element's actual position
    const rect = elementRef.current.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;

    // Store current position in ref
    positionRef.current = { x: currentX, y: currentY };
    dragStartRef.current = { 
      x: clientX - currentX, 
      y: clientY - currentY 
    };

    // Pre-calculate boundaries once
    boundariesRef.current = {
      maxX: window.innerWidth - rect.width,
      maxY: window.innerHeight - rect.height,
    };

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  }, []);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!elementRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    // Calculate new position
    const newX = clientX - dragStartRef.current.x;
    const newY = clientY - dragStartRef.current.y;

    // Clamp to boundaries
    const clampedX = Math.max(0, Math.min(newX, boundariesRef.current.maxX));
    const clampedY = Math.max(0, Math.min(newY, boundariesRef.current.maxY));

    // Update ref immediately
    positionRef.current = { x: clampedX, y: clampedY };

    // Cancel previous RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Schedule visual update with RAF (60fps)
    rafIdRef.current = requestAnimationFrame(() => {
      if (elementRef.current) {
        // Use left/top instead of transform to work with resize
        elementRef.current.style.left = `${clampedX}px`;
        elementRef.current.style.top = `${clampedY}px`;
        elementRef.current.style.right = 'auto';
        elementRef.current.style.bottom = 'auto';
      }
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    // Restore cursor and selection
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    // Cancel any pending RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Persist final position to state (single update)
    setPosition(positionRef.current);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Re-clamp position if window resizes
  useEffect(() => {
    const onResize = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      setPosition((p) => ({
        x: Math.max(0, Math.min(p.x, maxX)),
        y: Math.max(0, Math.min(p.y, maxY)),
      }));
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    isDragging,
    position,
    elementRef,
    handleDragStart,
  };
};