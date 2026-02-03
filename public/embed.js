(function () {
  'use strict';

  // ============================================================================
  // 1. CONFIGURATION
  // ============================================================================
  const scriptTag = document.currentScript;
  const config = {
    tenantId: scriptTag.getAttribute('data-tenant-id') || 'default',
    botName: scriptTag.getAttribute('data-bot-name') || 'GeminiBot',
    primaryColor: scriptTag.getAttribute('data-primary-color') || '#2563eb',
    position: scriptTag.getAttribute('data-position') || 'bottom-right',
    language: scriptTag.getAttribute('data-language') || 'vi',
  };

  // ============================================================================
  // 2. MAIN WIDGET CREATOR
  // ============================================================================
  const createChatWidget = () => {
    if (document.getElementById('geminibot-widget')) return;

    const isLeft = config.position.includes('left');

    // ============================================================================
    // 3. STATE
    // ============================================================================
    const state = {
      isOpen: false,
    };

    // ============================================================================
    // 4. LAUNCHER BUTTON (Outside iframe, always clickable)
    // ============================================================================
    const button = document.createElement('button');
    button.id = 'geminibot-button';
    button.type = 'button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
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

    button.onmouseover = () => {
      button.style.transform = 'scale(1.06)';
      button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    };
    button.onmouseout = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    };

    // ============================================================================
    // 5. IFRAME CONTAINER - Positioned like the chat widget, not fullscreen
    // ============================================================================
    const container = document.createElement('div');
    container.id = 'geminibot-widget';
    container.style.cssText = `
      position: fixed;
      ${isLeft ? 'left: 20px;' : 'right: 20px;'}
      bottom: 90px;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 999999;
      display: none;
    `;

    // ============================================================================
    // 6. IFRAME - Fullscreen but transparent to clicks outside chat
    // ============================================================================
    const iframe = document.createElement('iframe');
    iframe.id = 'geminibot-iframe';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'GeminiBot Chat');
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      border: none;
      background: transparent;
      pointer-events: auto;
      z-index: 999999;
    `;

    // ============================================================================
    // 7. IFRAME URL SETUP
    // ============================================================================
    const params = new URLSearchParams({
      tenantId: config.tenantId,
      botName: config.botName,
      primaryColor: config.primaryColor,
      language: config.language,
      hideButton: 'true',
    });

    const scriptSrc = scriptTag.src;
    const widgetBaseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    iframe.src = `${widgetBaseUrl}/widget?${params.toString()}`;

    // ============================================================================
    // 8. BUTTON CLICK HANDLER
    // ============================================================================
    const updateButton = () => {
      button.innerHTML = state.isOpen
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

      container.style.display = state.isOpen ? 'block' : 'none';

      // Tell iframe to open/close
      try {
        iframe.contentWindow?.postMessage(
          { type: 'GEMINIBOT_TOGGLE', isOpen: state.isOpen },
          '*'
        );
      } catch (e) {}
    };

    button.onclick = () => {
      state.isOpen = !state.isOpen;
      updateButton();
    };

    // Listen for close message from iframe
    window.addEventListener('message', (event) => {
      if (event.data === 'GEMINIBOT_CLOSE') {
        state.isOpen = false;
        updateButton();
      }
    });

    // ============================================================================
    // 9. MOUNT
    // ============================================================================
    container.appendChild(iframe);
    document.body.appendChild(container);
    document.body.appendChild(button);
  };

  // ============================================================================
  // 10. INITIALIZATION
  // ============================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();