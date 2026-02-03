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

(function() {
  'use strict';

  // Get configuration from script tag attributes
  const scriptTag = document.currentScript;
  const config = {
    apiUrl: scriptTag.getAttribute('data-api-url') || 'http://localhost:3001/api',
    tenantId: scriptTag.getAttribute('data-tenant-id') || 'default',
    botName: scriptTag.getAttribute('data-bot-name') || 'GeminiBot',
    primaryColor: scriptTag.getAttribute('data-primary-color') || '#2563eb',
    position: scriptTag.getAttribute('data-position') || 'bottom-right',
    language: scriptTag.getAttribute('data-language') || 'vi'
  };

  console.log('🤖 GeminiBot Embed Loading...', config);

  // Detect if mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 640;

  // Create iframe container
  const createChatWidget = () => {
    // Create container
    const container = document.createElement('div');
    container.id = 'geminibot-widget';
    
    if (isMobile) {
      // Mobile: Fixed positioning covering entire screen when open
      container.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        top: 0;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        pointer-events: none;
      `;
    } else {
      // Desktop: Bottom-right corner
      container.style.cssText = `
        position: fixed;
        ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        bottom: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
    }

    // Create chat button
    const button = document.createElement('button');
    button.id = 'geminibot-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    
    if (isMobile) {
      // Mobile button styling
      button.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 16px;
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
        transition: all 0.3s ease;
        z-index: 1000000;
        pointer-events: auto;
      `;
    } else {
      // Desktop button styling
      button.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: ${config.primaryColor};
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        pointer-events: auto;
      `;
    }

    button.onmouseover = () => {
      button.style.transform = 'scale(1.1)';
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
    
    if (isMobile) {
      // Mobile: Full screen
      iframe.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        z-index: 999999;
        pointer-events: auto;
      `;
    } else {
      // Desktop: Floating window
      iframe.style.cssText = `
        display: none;
        width: 400px;
        height: 600px;
        max-height: 85vh;
        border: none;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        margin-bottom: 20px;
        pointer-events: auto;
      `;
    }

    // Build iframe URL with config parameters
    const params = new URLSearchParams({
      tenantId: config.tenantId,
      botName: config.botName,
      primaryColor: config.primaryColor,
      language: config.language,
      embedded: 'true'
    });
    
    // Get the frontend URL from where this script was loaded
    const scriptSrc = scriptTag.src;
    const widgetBaseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    
    iframe.src = `${widgetBaseUrl}/widget?${params.toString()}`;

    console.log('📍 Widget URL:', iframe.src);

    // Toggle chat visibility
    let isOpen = false;
    button.onclick = () => {
      isOpen = !isOpen;
      if (isOpen) {
        iframe.style.display = 'block';
        button.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        
        // On mobile, hide the button when chat is open
        if (isMobile) {
          button.style.display = 'none';
        }
      } else {
        iframe.style.display = 'none';
        button.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
        
        // On mobile, show the button when chat is closed
        if (isMobile) {
          button.style.display = 'flex';
        }
      }
    };

    // Listen for close message from iframe (for mobile close button)
    window.addEventListener('message', (event) => {
      if (event.data === 'GEMINIBOT_CLOSE') {
        isOpen = false;
        iframe.style.display = 'none';
        button.style.display = 'flex';
        button.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      }
    });

    // Add to page
    container.appendChild(iframe);
    container.appendChild(button);
    document.body.appendChild(container);

    console.log('✅ GeminiBot Widget Loaded');
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();