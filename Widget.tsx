import React, { useEffect, useState } from 'react';
import ChatWidget from './components/ChatWidget';
import { AppConfig } from './types';

/**
 * Standalone Widget Page
 * This page is loaded in an iframe for embedding on external sites
 */
const Widget: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    // Get configuration from URL parameters
    const params = new URLSearchParams(window.location.search);
    
    const widgetConfig: AppConfig = {
      tenantId: params.get('tenantId') || 'default',
      botName: params.get('botName') || 'GeminiBot',
      welcomeMessage: params.get('welcomeMessage') || 'Xin chào! Tôi có thể giúp gì cho bạn?',
      primaryColor: params.get('primaryColor') || '#2563eb',
      theme: (params.get('theme') as 'light' | 'dark') || 'light',
      enableSound: params.get('enableSound') !== 'false',
      enableFeedback: params.get('enableFeedback') !== 'false',
      suggestedQuestions: [],
      defaultLanguage: (params.get('language') as 'vi' | 'en') || 'vi',
      systemPrompt: params.get('systemPrompt') || undefined
    };

    setConfig(widgetConfig);

    // Notify parent that widget is ready
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'GEMINIBOT_READY' }, '*');
    }
  }, []);

  if (!config) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'sans-serif',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <ChatWidget config={config} isEmbedded={true} />
    </div>
  );
};

export default Widget;