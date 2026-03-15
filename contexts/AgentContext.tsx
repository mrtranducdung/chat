import React, { createContext, useContext, useState } from 'react';

interface AgentSettings {
  name: string;
  logo: string | null;
}

interface AgentContextType {
  agentSettings: AgentSettings;
  updateAgentSettings: (settings: Partial<AgentSettings>) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentSettings, setAgentSettings] = useState<AgentSettings>(() => {
    const saved = localStorage.getItem('agent_settings');
    return saved ? JSON.parse(saved) : { name: 'AI Agent', logo: null };
  });

  const updateAgentSettings = (settings: Partial<AgentSettings>) => {
    setAgentSettings(prev => {
      const updated = { ...prev, ...settings };
      localStorage.setItem('agent_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AgentContext.Provider value={{ agentSettings, updateAgentSettings }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
