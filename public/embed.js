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

    // Container is only an anchor; does not control sizing.
    const container = document.createElement('div');
    container.id = 'geminibot-widget';
    container.style.cssText = `
      position: fixed;
      z-index: 999999;
      pointer-events: none;
    `;

    // --- Button (always visible; toggles open/close) ---
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

    // --- Iframe (ALWAYS floating, responsive size ~1/4 screen) ---
    const iframe = document.createElement('iframe');
    iframe.id = 'geminibot-iframe';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('title', 'GeminiBot Chat');

    const applyIframeStyle = () => {
      iframe.style.cssText = `
        display: ${isOpen ? 'block' : 'none'};
        position: fixed;
        ${isLeft ? 'left: 16px;' : 'right: 16px;'}
        bottom: 88px;

        /* ALWAYS proportional */
        width: 25vw;
        height: 60vh;

        /* optional safety so it never exceeds screen */
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 120px);

        border: none;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        background: transparent;
        pointer-events: auto;
        z-index: 1000000;
      `;
    };

    // Build iframe URL
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

    const syncUI = () => {
      applyButtonStyle();
      applyIframeStyle();
      setButtonIcon(isOpen);

      iframe.style.display = isOpen ? 'block' : 'none';
    };

    const openChat = () => {
      isOpen = true;
      syncUI();
    };

    const closeChat = () => {
      isOpen = false;
      syncUI();
    };

    button.onclick = () => {
      if (isOpen) closeChat();
      else openChat();
    };

    // Allow iframe to request close (optional)
    window.addEventListener('message', (event) => {
      if (event.data === 'GEMINIBOT_CLOSE') closeChat();
    });

    // Responsive: re-apply clamp sizing on resize/orientation changes
    let t = null;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(syncUI, 80);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // Mount
    document.body.appendChild(container);
    document.body.appendChild(iframe);
    document.body.appendChild(button);

    // Initial paint
    syncUI();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();
