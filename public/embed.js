/**
 * GeminiBot Embed Script
 * Add this script to any website to embed the chatbot
 *
 * Usage:
 * <script src="https://your-domain.com/embed.js"
 *         data-tenant-id="your-tenant-id"
 *         data-bot-name="YourBot"
 *         data-primary-color="#2563eb">
 * </script>
 */

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

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 640;

  const createChatWidget = () => {
    // Prevent double-inject
    if (document.getElementById('geminibot-widget')) return;

    // Create container (IMPORTANT: do NOT make this fullscreen)
    const container = document.createElement('div');
    container.id = 'geminibot-widget';

    const isRight = config.position.includes('right');
    const isLeft = config.position.includes('left');

    // Always keep container as a small fixed anchor in a corner
    container.style.cssText = `
      position: fixed;
      ${isLeft ? 'left: 20px;' : ''}
      ${isRight || !isLeft ? 'right: 20px;' : ''}
      bottom: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: ${isLeft ? 'flex-start' : 'flex-end'};
      gap: 12px;
      pointer-events: none; /* allow only children to interact */
    `;

    // Create button
    const button = document.createElement('button');
    button.id = 'geminibot-button';
    button.type = 'button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;

    button.style.cssText = `
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
    `;

    button.onmouseover = () => {
      button.style.transform = 'scale(1.06)';
      button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    };
    button.onmouseout = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    };

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'geminibot-iframe';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('title', 'GeminiBot Chat');

    // Desktop default size (floating window)
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

    // Build iframe URL with config parameters
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

    const openChat = () => {
      isOpen = true;

      // On mobile, make iframe fullscreen (NOT the container)
      if (isMobile) {
        iframe.style.cssText = `
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          border: none;
          border-radius: 0;
          box-shadow: none;
          z-index: 1000000;
          pointer-events: auto;
          background: transparent;
        `;
        // Hide launcher button on mobile when open
        button.style.display = 'none';
      } else {
        iframe.style.display = 'block';
      }

      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    };

    const closeChat = () => {
      isOpen = false;
      iframe.style.display = 'none';

      // Restore desktop iframe style if mobile toggled fullscreen previously
      if (isMobile) {
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
        button.style.display = 'flex';
      }

      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    };

    button.onclick = () => {
      if (isOpen) closeChat();
      else openChat();
    };

    // Listen for close message from iframe
    window.addEventListener('message', (event) => {
      if (event.data === 'GEMINIBOT_CLOSE') {
        closeChat();
      }
    });

    // Add to page (iframe above button visually)
    container.appendChild(iframe);
    container.appendChild(button);
    document.body.appendChild(container);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();