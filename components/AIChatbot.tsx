import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Briefcase, Users, DollarSign, ChevronDown, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AGENTS = [
  { id: 'sales', name: 'Sales Copilot', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100', prompt: 'Analyze the Q3 sales pipeline' },
  { id: 'hr', name: 'HR Assistant', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100', prompt: 'Create an offer letter for an engineer' },
  { id: 'finance', name: 'Finance Analyst', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100', prompt: 'Show P&L variance against plan' },
];

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  chartData?: any;
  suggestions?: string[];
}

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [showAgentSelect, setShowAgentSelect] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: `Hello! I'm ${AGENTS[0].name}. How can I help you today?`, isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Message[]>([]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.initialMessage) {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: e.detail.initialMessage, isBot: true }]);
      }
    };
    window.addEventListener('open-ai-chatbot', handleOpen);
    return () => window.removeEventListener('open-ai-chatbot', handleOpen);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    historyRef.current = messages;
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input.trim();
    if (!userMsg || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: userMsg, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, text: '', isBot: true }]);

    try {
      const tenantId = (() => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) return 'default';
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.tenantId || 'default';
        } catch { return 'default'; }
      })();

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } : {}),
        },
        body: JSON.stringify({
          message: userMsg,
          history: historyRef.current.filter(m => m.id !== 'welcome'),
          botName: activeAgent.name,
          language,
          tenantId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });

          setMessages(prev =>
            prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m)
          );
        }
      }

      // Parse JSON blocks for charts and suggestions
      let chartData = null;
      let suggestions: string[] | undefined;
      const jsonBlocks = [...fullText.matchAll(/```json\n([\s\S]*?)\n```/g)];
      for (const match of jsonBlocks) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed.type === 'chart') chartData = parsed;
          else if (parsed.type === 'suggestions') suggestions = parsed.questions;
        } catch {}
      }

      const cleanText = fullText.replace(/```json\n[\s\S]*?\n```/g, '').trim();

      setMessages(prev =>
        prev.map(m => m.id === botMsgId
          ? { ...m, text: cleanText || (chartData?.title ?? ''), chartData, suggestions }
          : m
        )
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(m => m.id === botMsgId
          ? { ...m, text: 'Sorry, I encountered an error processing your request. Please try again.' }
          : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (chartData: any) => {
    if (!chartData?.data) return null;
    return (
      <div className="mt-3 w-full h-48 bg-white rounded-xl p-2 border border-slate-100 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          {chartData.chartType === 'line' ? (
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          ) : chartData.chartType === 'pie' ? (
            <PieChart>
              <Pie data={chartData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={35} paddingAngle={2}>
                {chartData.data.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none' }} />
            </PieChart>
          ) : (
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-transform hover:scale-105 z-50 flex items-center justify-center group"
      >
        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
            className="fixed bottom-24 md:bottom-24 right-4 md:right-6 w-[380px] h-[600px] bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between relative z-20">
              <div className="relative">
                <button
                  onClick={() => setShowAgentSelect(!showAgentSelect)}
                  className="flex items-center gap-2 hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full ${activeAgent.bg} ${activeAgent.color} flex items-center justify-center`}>
                    <activeAgent.icon size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      {activeAgent.name} <ChevronDown size={14} className="text-slate-400" />
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {showAgentSelect && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                    >
                      {AGENTS.map(agent => (
                        <button
                          key={agent.id}
                          onClick={() => {
                            setActiveAgent(agent);
                            setShowAgentSelect(false);
                            setMessages([{ id: 'welcome', text: `Hello! I'm ${agent.name}. How can I help you today?`, isBot: true }]);
                          }}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left ${activeAgent.id === agent.id ? 'bg-slate-50' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full ${agent.bg} ${agent.color} flex items-center justify-center shrink-0`}>
                            <agent.icon size={16} />
                          </div>
                          <div className="text-sm font-bold text-slate-800">{agent.name}</div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 1 && (
                <div className="flex flex-col gap-2 mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Suggested</p>
                  <button
                    onClick={() => handleSend(activeAgent.prompt)}
                    className="text-left p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-indigo-300 hover:shadow-sm transition-all flex items-center gap-2 group"
                  >
                    <Sparkles size={16} className="text-indigo-500 group-hover:animate-pulse" />
                    {activeAgent.prompt}
                  </button>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  {msg.isBot && (
                    <div className={`w-6 h-6 rounded-full ${activeAgent.bg} ${activeAgent.color} flex items-center justify-center shrink-0 mr-2 mt-1`}>
                      <activeAgent.icon size={12} />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${msg.isBot ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                    {msg.text}
                    {msg.chartData && renderChart(msg.chartData)}
                    {msg.suggestions && idx === messages.length - 1 && (
                      <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Follow-up questions</p>
                        <div className="flex flex-col gap-2">
                          {msg.suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(s)}
                              className="text-left text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.text === '' && (
                <div className="flex justify-start">
                  <div className={`w-6 h-6 rounded-full ${activeAgent.bg} ${activeAgent.color} flex items-center justify-center shrink-0 mr-2 mt-1`}>
                    <activeAgent.icon size={12} />
                  </div>
                  <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-white border border-slate-200 rounded-tl-none flex items-center gap-2 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                    <span className="text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Message ${activeAgent.name}...`}
                  disabled={isLoading}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all text-sm disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400">AI can make mistakes. Verify important information.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
