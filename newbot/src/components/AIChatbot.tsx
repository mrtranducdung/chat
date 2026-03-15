import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, BarChart2, Briefcase, Users, DollarSign, ChevronDown, Sparkles, Calendar, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { GoogleGenAI, Type } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useLocation } from 'react-router-dom';
import { INDUSTRIES, KPI_GROUPS, KPI_ITEMS } from '../data/kpiData';
import { useAgent } from '../context/AgentContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AGENTS = [
  { id: 'sales', name: '営業コパイロット', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100', prompt: '第3四半期のセールスパイプラインを分析して' },
  { id: 'hr', name: '人事アシスタント', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100', prompt: 'エンジニアの採用内定通知書を作成して' },
  { id: 'finance', name: '財務アナリスト', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100', prompt: '計画に対するP&Lの差異を表示して' },
];

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const { agentSettings } = useAgent();
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [showAgentSelect, setShowAgentSelect] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot: boolean; chartData?: any; actionData?: any; suggestions?: string[] }>([
    { text: t('chatbot.greeting').replace('{name}', agentSettings.name), isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.initialMessage) {
        setMessages(prev => [...prev, { text: e.detail.initialMessage, isBot: true }]);
      }
    };
    window.addEventListener('open-ai-chatbot', handleOpen);
    return () => window.removeEventListener('open-ai-chatbot', handleOpen);
  }, []);

  useEffect(() => {
    // Initialize Gemini Chat
    try {
      const pageContext = location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '');
      const dashboardContext = `
DASHBOARD CONTEXT:
The dashboard supports 14 industries. Here are the industries, their KPI groups, and all available KPIs:
${INDUSTRIES.map(ind => `
- ${ind.name}:
  Groups: ${KPI_GROUPS.filter(g => g.industryId === ind.id).map(g => g.name).join(', ')}
  KPIs: ${KPI_ITEMS.filter(k => k.groupId.startsWith(ind.id)).map(k => k.name).join(', ')}
`).join('')}
`;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are a highly capable AI Business Agent named ${agentSettings.name} assisting a Japanese SME CEO. You specialize in ${activeAgent.id}. Provide concise, professional, and actionable advice. You can communicate in Japanese, Vietnamese, and English depending on the user prompt.
          
CURRENT PAGE: The user is currently viewing the "${pageContext}" page of the application. If they ask general questions, tailor your response to this context.

${dashboardContext}
          
CRITICAL INSTRUCTION: When the user asks for business data, metrics, or statistics (e.g., revenue, sales, products sold, expenses), YOU MUST respond with a JSON block representing a chart, instead of long text.
The JSON block MUST be enclosed in \`\`\`json ... \`\`\` and follow this schema:
{
  "type": "chart",
  "chartType": "bar" | "line" | "pie",
  "title": "Chart Title",
  "data": [ { "name": "Label", "value": Number } ]
}

CRITICAL INSTRUCTION 2: At the end of EVERY response, you MUST provide 3 suggested follow-up questions related to the user's inquiry and your answer. Format these exactly as a JSON block like this:
\`\`\`json
{
  "type": "suggestions",
  "questions": ["Question 1", "Question 2", "Question 3"]
}
\`\`\`
Do not include any other text outside the JSON blocks if you are returning a chart.`,
          tools: [{
            functionDeclarations: [
              {
                name: "scheduleMeeting",
                description: "Schedule a meeting with the team or a specific person.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Meeting title" },
                    time: { type: Type.STRING, description: "Meeting time (e.g., 'tomorrow at 10 AM')" },
                    attendees: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of attendees" }
                  },
                  required: ["title", "time"]
                }
              },
              {
                name: "consultOtherAgent",
                description: "Consult another specialized AI agent (e.g., 'sales', 'hr', 'finance') for specific domain knowledge.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    targetAgentId: { type: Type.STRING, description: "The ID of the agent to consult (sales, hr, finance)" },
                    question: { type: Type.STRING, description: "The question to ask the agent" }
                  },
                  required: ["targetAgentId", "question"]
                }
              }
            ]
          }]
        },
      });
    } catch (error) {
      console.error("Failed to initialize Gemini:", error);
    }
  }, [activeAgent, location.pathname]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadedFile({ name: file.name, content });
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input.trim();
    if (!userMsg && !uploadedFile) return;
    
    let displayMsg = userMsg;
    let apiMsg = userMsg;

    if (uploadedFile) {
      displayMsg = userMsg ? `${userMsg}\n\n📎 ${uploadedFile.name}` : `📎 ${uploadedFile.name}`;
      apiMsg = `${userMsg}\n\n[Uploaded File Content from ${uploadedFile.name}]:\n${uploadedFile.content}`;
    }

    setMessages((prev) => [...prev, { text: displayMsg, isBot: false }]);
    setInput('');
    setUploadedFile(null);
    setIsLoading(true);

    try {
      if (chatRef.current) {
        const response = await chatRef.current.sendMessage({ message: apiMsg });
        let responseText = response.text || '';
        let chartData = null;
        let actionData = null;
        let suggestions = null;

        if (response.functionCalls && response.functionCalls.length > 0) {
          const call = response.functionCalls[0];
          if (call.name === 'scheduleMeeting') {
            actionData = {
              type: 'meeting',
              title: call.args.title,
              time: call.args.time,
              attendees: call.args.attendees || []
            };
            responseText = responseText || t('chatbot.meetingScheduled');
          } else if (call.name === 'consultOtherAgent') {
            const targetAgent = AGENTS.find(a => a.id === call.args.targetAgentId) || AGENTS[0];
            
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
            const tempChat = ai.chats.create({
              model: 'gemini-3-flash-preview',
              config: {
                systemInstruction: `You are ${targetAgent.name}. Answer this question concisely and professionally: ${call.args.question}`
              }
            });
            const consultResponse = await tempChat.sendMessage({ message: call.args.question });
            
            actionData = {
              type: 'consult',
              agent: targetAgent,
              question: call.args.question,
              answer: consultResponse.text
            };
            responseText = responseText || t('chatbot.answerFrom').replace('{name}', targetAgent.name);
          }
        }

        // Check if response contains JSON blocks
        const jsonBlocks = [...responseText.matchAll(/```json\n([\s\S]*?)\n```/g)];
        for (const match of jsonBlocks) {
          try {
            const parsed = JSON.parse(match[1]);
            if (parsed.type === 'chart') {
              chartData = parsed;
            } else if (parsed.type === 'suggestions') {
              suggestions = parsed.questions;
            }
          } catch (e) {
            console.error("Failed to parse JSON block", e);
          }
        }
        
        // Remove all json blocks from the text
        responseText = responseText.replace(/```json\n[\s\S]*?\n```/g, '').trim();
        if (!responseText && chartData) {
           responseText = chartData.title || t('chatbot.requestedData');
        }

        setMessages((prev) => [...prev, { text: responseText, isBot: true, chartData, actionData, suggestions }]);
      } else {
        throw new Error("Chat not initialized");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { text: t('chatbot.error'), isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (chartData: any) => {
    if (!chartData || !chartData.data) return null;

    return (
      <div className="mt-3 w-full h-48 bg-white rounded-xl p-2 border border-slate-100 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          {chartData.chartType === 'line' ? (
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : chartData.chartType === 'pie' ? (
            <PieChart>
              <Pie data={chartData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={35} paddingAngle={2}>
                {chartData.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-transform hover:scale-105 z-50 flex items-center justify-center group"
      >
        {isOpen ? (
          <X size={28} className="group-hover:rotate-90 transition-transform" />
        ) : (
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
        )}
        {!isOpen && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="fixed bottom-24 md:bottom-24 right-4 md:right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between relative z-20">
              <div className="relative">
                <button 
                  onClick={() => setShowAgentSelect(!showAgentSelect)}
                  className="flex items-center gap-2 hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg transition-colors"
                >
                  {agentSettings.logo ? (
                    <img src={agentSettings.logo} alt="Agent Logo" className="h-8 w-auto max-w-[80px] object-contain" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full ${activeAgent.bg} ${activeAgent.color} flex items-center justify-center`}>
                      <activeAgent.icon size={16} />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      {agentSettings.name} <ChevronDown size={14} className="text-slate-400" />
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t('chatbot.online')}
                    </div>
                  </div>
                </button>

                {/* Agent Dropdown */}
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
                            setMessages([{ text: t('chatbot.greeting').replace('{name}', agent.name), isBot: true }]);
                          }}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left ${activeAgent.id === agent.id ? 'bg-slate-50' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full ${agent.bg} ${agent.color} flex items-center justify-center shrink-0`}>
                            <agent.icon size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{agent.name}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.length === 1 && (
                <div className="flex flex-col gap-2 mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{t('chatbot.suggestedQuestions')}</p>
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
                <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  {msg.isBot && (
                    agentSettings.logo ? (
                      <img src={agentSettings.logo} alt="Agent Logo" className="h-6 w-auto max-w-[60px] object-contain shrink-0 mr-2 mt-1" />
                    ) : (
                      <div className={`w-6 h-6 rounded-full ${activeAgent.bg} ${activeAgent.color} flex items-center justify-center shrink-0 mr-2 mt-1`}>
                        <activeAgent.icon size={12} />
                      </div>
                    )
                  )}
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${msg.isBot ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                    {msg.text}
                    {msg.chartData && renderChart(msg.chartData)}
                    
                    {msg.actionData && msg.actionData.type === 'meeting' && (
                      <div className="mt-3 w-full bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                          <Calendar size={16} /> {t('chatbot.meetingScheduled')}
                        </div>
                        <div className="text-xs text-indigo-600">
                          <p><strong>{t('chatbot.title')}:</strong> {msg.actionData.title}</p>
                          <p><strong>{t('chatbot.time')}:</strong> {msg.actionData.time}</p>
                          {msg.actionData.attendees && msg.actionData.attendees.length > 0 && <p><strong>{t('chatbot.attendees')}:</strong> {msg.actionData.attendees.join(', ')}</p>}
                        </div>
                      </div>
                    )}

                    {msg.actionData && msg.actionData.type === 'consult' && (
                      <div className="mt-3 w-full bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                          <div className={`w-5 h-5 rounded-full ${msg.actionData.agent.bg} ${msg.actionData.agent.color} flex items-center justify-center shrink-0`}>
                            <msg.actionData.agent.icon size={10} />
                          </div>
                          {t('chatbot.answerFrom').replace('{name}', msg.actionData.agent.name)}
                        </div>
                        <div className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-2">
                          "{msg.actionData.answer}"
                        </div>
                      </div>
                    )}

                    {msg.suggestions && idx === messages.length - 1 && (
                      <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('chatbot.nextQuestions')}</p>
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
              {isLoading && (
                <div className="flex justify-start">
                  {agentSettings.logo ? (
                    <img src={agentSettings.logo} alt="Agent Logo" className="h-6 w-auto max-w-[60px] object-contain shrink-0 mr-2 mt-1" />
                  ) : (
                    <div className={`w-6 h-6 rounded-full ${activeAgent.bg} ${activeAgent.color} flex items-center justify-center shrink-0 mr-2 mt-1`}>
                      <activeAgent.icon size={12} />
                    </div>
                  )}
                  <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-white border border-slate-200 text-slate-800 rounded-tl-none flex items-center gap-2 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                    {t('chatbot.thinking')}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              {uploadedFile && (
                <div className="mb-2 flex items-center justify-between bg-indigo-50 text-indigo-700 text-xs px-3 py-2 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip size={14} />
                    <span className="truncate">{uploadedFile.name}</span>
                  </div>
                  <button onClick={() => setUploadedFile(null)} className="hover:text-indigo-900 ml-2">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="relative flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.csv,.json"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="absolute left-2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  title={t('chatbot.uploadData')}
                >
                  <Paperclip size={18} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('chatbot.sendMessage').replace('{name}', agentSettings.name)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all text-sm disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || (!input.trim() && !uploadedFile)}
                  className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:hover:bg-indigo-600"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400">{t('chatbot.aiWarning')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
