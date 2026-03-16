import React from 'react';
import { motion } from 'motion/react';
import { Bot, AlertTriangle, TrendingDown, FileText, Database, Settings, ChevronRight, BarChart3, Users, PieChart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AgentSummary = () => {
  const { t } = useLanguage();

  const features = [
    {
      id: 'proactive-alerts',
      title: t('agentSummary.proactiveAlerts.title') || 'Proactive Revenue Alerts',
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      description: t('agentSummary.proactiveAlerts.desc') || 'The AI agent continuously monitors your KPIs. If revenue or margin drops below the target threshold, it proactively alerts you and suggests immediate actions.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=400',
      color: 'bg-amber-50 border-amber-200 text-amber-800'
    },
    {
      id: 'deal-risk',
      title: t('agentSummary.dealRisk.title') || 'Deal Risk Analysis',
      icon: <TrendingDown className="text-red-500" size={24} />,
      description: t('agentSummary.dealRisk.desc') || 'Analyzes pipeline deals to identify at-risk opportunities based on historical data, engagement levels, and market trends, providing actionable recommendations to save the deal.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=400',
      color: 'bg-red-50 border-red-200 text-red-800'
    },
    {
      id: 'what-if',
      title: t('agentSummary.whatIf.title') || 'What-If Simulations',
      icon: <PieChart className="text-indigo-500" size={24} />,
      description: t('agentSummary.whatIf.desc') || 'Run complex scenarios like changing discount levels or shifting close dates to instantly see the impact on Gross Margin and Q3/Q4 revenue attainment.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=400',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    },
    {
      id: 'auto-reporting',
      title: t('agentSummary.autoReporting.title') || 'Auto Reporting & Distribution',
      icon: <FileText className="text-emerald-500" size={24} />,
      description: t('agentSummary.autoReporting.desc') || 'Automatically generates comprehensive reports (PDF, Excel, PPT) and distributes them to stakeholders via Email or LINE WORKS based on your schedule.',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800&h=400',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    },
    {
      id: 'data-integration',
      title: t('agentSummary.dataIntegration.title') || 'Seamless Data Integration',
      icon: <Database className="text-blue-500" size={24} />,
      description: t('agentSummary.dataIntegration.desc') || 'Connects with your CRM, ERP, M365, and custom documents to build a unified knowledge base for the AI agent to draw insights from.',
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800&h=400',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 'persona-config',
      title: t('agentSummary.personaConfig.title') || 'Customizable Persona',
      icon: <Settings className="text-slate-500" size={24} />,
      description: t('agentSummary.personaConfig.desc') || "Tailor the AI agent's identity, tone of voice (Professional, Friendly, Direct), and escalation paths to match your company culture.",
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800&h=400',
      color: 'bg-slate-50 border-slate-200 text-slate-800'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Bot size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('agentSummary.title') || 'AI Agent Features'}</h1>
          <p className="text-slate-500 mt-1">{t('agentSummary.subtitle') || 'Comprehensive overview of AI capabilities for your presentation slides.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-48 overflow-hidden relative">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white drop-shadow-md">{feature.title}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
