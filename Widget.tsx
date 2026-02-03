import React, { useEffect, useState } from 'react';
import ChatWidget from './components/ChatWidget';
import { AppConfig } from './types';

const Widget: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    // Make body transparent and allow clicks to pass through
    document.body.style.background = 'transparent';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    // CRITICAL: Make the page transparent to clicks
    document.body.style.pointerEvents = 'none';
    
    const params = new URLSearchParams(window.location.search);
    const hideButton = params.get('hideButton') === 'true';

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
      systemPrompt: params.get('systemPrompt') || undefined,
    };

    setConfig(widgetConfig);

    // Listen for toggle messages from parent
    if (hideButton) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GEMINIBOT_TOGGLE') {
          setForceOpen(event.data.isOpen);
        }
      };
      
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, []);

  if (!config) return null;

  const params = new URLSearchParams(window.location.search);
  const hideButton = params.get('hideButton') === 'true';

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      pointerEvents: 'none' // Make wrapper transparent to clicks
    }}>
      <ChatWidget 
        config={config} 
        isEmbedded={false}
        {...(hideButton ? { 
          externalControl: true,
          forceOpen: forceOpen 
        } : {})}
      />
    </div>
  );
};

export default Widget;