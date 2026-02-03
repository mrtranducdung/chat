(function () {
  'use strict';

  const scriptTag = document.currentScript;
  const config = {
    apiUrl: scriptTag.getAttribute('data-api-url') || 'http://localhost:3001/api',
    tenantId: scriptTag.getAttribute('data-tenant-id') || 'default',
    botName: scriptTag.getAttribute('data-bot-name') || 'GeminiBot',
    primaryColor: scriptTag.getAttribute('data-primary-color') || '#2563eb',
    position: scriptTag.getAttribute('data-position') || 'bottom-right',
    language: scriptTag.getAttribute('data-language') || 'vi',
  };

  const computeIsMobile = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 640;

  const createChatWidget = () => {
    if (document.getElementById('geminibot-widget')) return;

    const isRight = config.position.includes('right');
    const isLeft = config.position.includes('left');

    // Container: anchor (never fullscreen)
    const container = document.createElement('div');
    container.id = 'geminibot-widget';
    container.style.cssText = `
      position: fixed;
      ${isLeft ? 'left: 20px;' : ''}
      ${isRight || !isLeft ? 'right: 20px;' : ''}
      bottom: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      pointer-events: auto;
    `;

    // Button: fixed, independent of container size
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
      const isMobile = computeIsMobile();
      button.style.cssText = `
        position: fixed;
        ${isLeft ? 'left: 16px;' : 'right: 16px;'}
        bottom: 16px;
        width: ${isMobile ? '56px' : '60px'};
        height: ${isMobile ? '56px' : '60px'};
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
        z-index: 1000001;
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
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('title', 'GeminiBot Chat');

    const applyIframeDesktopStyle = () => {
      iframe.style.cssText = `
        display: none;
        width: 400px;
        height: 600px;
        max-height: 85vh;
        border: none;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        pointer-events: auto;
        background: transparent;
      `;
    };

    const applyIframeMobileStyleOpen = () => {
      iframe.style.cssText = `
        display: block;
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        border: none;
        border-radius: 0;
        box-shadow: none;
        z-index: 1000000;
        pointer-events: auto;
        background: transparent;
      `;
    };

    applyIframeDesktopStyle();

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

    let isOpen = false;

    const syncOpenUI = () => {
      const isMobile = computeIsMobile();

      applyButtonStyle();
      setButtonIcon(isOpen);

      if (!isOpen) {
        iframe.style.display = 'none';
        // show button always when closed
        button.style.display = 'flex';
        // restore desktop iframe base styles so next open works correctly
        applyIframeDesktopStyle();
        return;
      }

      // OPEN state
      if (isMobile) {
        applyIframeMobileStyleOpen();
        // hide launcher button when chat open on mobile (like your previous behavior)
        button.style.display = 'none';
      } else {
        // desktop floating
        applyIframeDesktopStyle();
        iframe.style.display = 'block';
        iframe.style.marginBottom = '80px'; // space above fixed button
        button.style.display = 'flex';
      }
    };

    const openChat = () => {
      isOpen = true;
      syncOpenUI();
    };

    const closeChat = () => {
      isOpen = false;
      syncOpenUI();
    };

    button.onclick = () => {
      if (isOpen) closeChat();
      else openChat();
    };

    // Close message from iframe
    window.addEventListener('message', (event) => {
      if (event.data === 'GEMINIBOT_CLOSE') {
        closeChat();
      }
    });

    // Responsive: recompute on resize/orientation changes
    let resizeTimer = null;
    const onResize = () => {
      // debounce to avoid thrashing
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        syncOpenUI();
      }, 80);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // Mount
    container.appendChild(iframe);
    document.body.appendChild(container);
    document.body.appendChild(button);

    // initial styles
    syncOpenUI();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();
