(function () {
  'use strict';

  const scriptTag = document.currentScript;
  const config = {
    tenantId: scriptTag.getAttribute('data-tenant-id') || 'default',
    botName: scriptTag.getAttribute('data-bot-name') || 'GeminiBot',
    primaryColor: scriptTag.getAttribute('data-primary-color') || '#2563eb',
    position: scriptTag.getAttribute('data-position') || 'bottom-right',
    language: scriptTag.getAttribute('data-language') || 'vi',
  };

  const createChatWidget = () => {
    if (document.getElementById('geminibot-widget')) return;

    const isRight = config.position.includes('right');
    const isLeft = config.position.includes('left');

    // IMPORTANT: pointer-events MUST be auto so iframe can scroll/click reliably
    const container = document.createElement('div');
    container.id = 'geminibot-widget';
    container.style.cssText = `
      position: fixed;
      z-index: 999999;
      pointer-events: auto;
    `;

    // Button
    const button = document.createElement('button');
    button.id = 'geminibot-button';
    button.type = 'button';

    const setButtonIcon = (open) => {
      button.innerHTML = open
        ? `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `
        : `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
    };

    const applyButtonStyle = () => {
      button.style.cssText = `
        position: fixed;
        ${isLeft ? 'left: 16px;' : 'right: 16px;'}
        bottom: 16px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: ${config.primaryColor};
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        pointer-events: auto;
        z-index: 1000002;
      `;
    };

    button.onmouseover = () => {
      button.style.transform = 'scale(1.06)';
      button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    };
    button.onmouseout = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    };

    // Iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'geminibot-iframe';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no'); // scroll happens inside the iframe content
    iframe.setAttribute('title', 'GeminiBot Chat');

    // Your clamp sizes
    const w = 'clamp(200px, 25vw, 420px)';
    const h = 'clamp(380px, 60vh, 620px)';

    // Position state (we drag using left/top)
    const state = {
      open: false,
      x: 0,
      y: 0,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      originX: 0,
      originY: 0,
      hasPositionedOnce: false,
    };

    const applyIframeStyle = () => {
      iframe.style.cssText = `
        display: ${state.open ? 'block' : 'none'};
        position: fixed;
        left: ${state.x}px;
        top: ${state.y}px;
        width: ${w};
        height: ${h};
        border: none;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        background: transparent;
        pointer-events: auto;
        z-index: 1000000;
      `;
    };

    // Drag handle only over header area
    const dragHandle = document.createElement('div');
    dragHandle.id = 'geminibot-drag-handle';
    dragHandle.style.cssText = `
      display: none;
      position: fixed;
      left: ${state.x}px;
      top: ${state.y}px;
      height: 52px;
      width: calc(${w});
      cursor: move;
      z-index: 1000001;
      pointer-events: auto;
      background: transparent;
      border-radius: 16px 16px 0 0;
      touch-action: none;
    `;

    const applyHandleStyle = () => {
      dragHandle.style.display = state.open ? 'block' : 'none';
      dragHandle.style.left = `${state.x}px`;
      dragHandle.style.top = `${state.y}px`;
      dragHandle.style.width = `calc(${w})`;
    };

    const clampToViewport = () => {
      const rect = iframe.getBoundingClientRect();
      const maxX = Math.max(0, window.innerWidth - rect.width);
      const maxY = Math.max(0, window.innerHeight - rect.height);
      state.x = Math.max(0, Math.min(state.x, maxX));
      state.y = Math.max(0, Math.min(state.y, maxY));
    };

    // ✅ Correct bottom-right start: measure real size after open and place it
    const positionBottomCornerUsingRealSize = () => {
      const rect = iframe.getBoundingClientRect();
      const padding = 16;
      const aboveButton = 88; // button + gap

      state.x = isLeft ? padding : Math.max(0, window.innerWidth - rect.width - padding);
      state.y = Math.max(0, window.innerHeight - rect.height - aboveButton);
      clampToViewport();
    };

    // iframe URL
    const params = new URLSearchParams({
      tenantId: config.tenantId,
      botName: config.botName,
      primaryColor: config.primaryColor,
      language: config.language,
      embedded: 'true',
    });

    const scriptSrc = scriptTag.src;
    const widgetBaseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    iframe.src = `${widgetBaseUrl}/widget?${params.toString()}`;

    const syncUI = () => {
      applyButtonStyle();
      setButtonIcon(state.open);
      applyIframeStyle();
      applyHandleStyle();

      if (state.open && !state.hasPositionedOnce) {
        // Wait for browser to compute real rect, then place bottom-right
        requestAnimationFrame(() => {
          positionBottomCornerUsingRealSize();
          state.hasPositionedOnce = true;
          applyIframeStyle();
          applyHandleStyle();
        });
      }
    };

    const openChat = () => {
      state.open = true;
      syncUI();
    };

    const closeChat = () => {
      state.open = false;
      syncUI();
    };

    button.onclick = () => {
      state.open ? closeChat() : openChat();
    };

    window.addEventListener('message', (event) => {
      if (event.data === 'GEMINIBOT_CLOSE') closeChat();
    });

    // Drag logic
    const getPoint = (e) => {
      if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    };

    const onDragStart = (e) => {
      if (!state.open) return;
      state.dragging = true;
      const p = getPoint(e);
      state.dragStartX = p.x;
      state.dragStartY = p.y;
      state.originX = state.x;
      state.originY = state.y;
      e.preventDefault();
    };

    const onDragMove = (e) => {
      if (!state.dragging) return;
      const p = getPoint(e);
      state.x = state.originX + (p.x - state.dragStartX);
      state.y = state.originY + (p.y - state.dragStartY);
      clampToViewport();
      applyIframeStyle();
      applyHandleStyle();
      e.preventDefault();
    };

    const onDragEnd = () => {
      state.dragging = false;
    };

    dragHandle.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    dragHandle.addEventListener('touchstart', onDragStart, { passive: false });
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd);

    // Resize/orientation: keep it on-screen
    let t = null;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (state.open) {
          clampToViewport();
          applyIframeStyle();
          applyHandleStyle();
        }
      }, 80);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // Mount
    container.appendChild(iframe);
    document.body.appendChild(container);
    document.body.appendChild(dragHandle);
    document.body.appendChild(button);

    syncUI();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();
