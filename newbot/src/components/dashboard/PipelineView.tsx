import React from 'react';
import { motion } from 'motion/react';
import { Search, Bell, Bot, Filter, ChevronRight, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, DollarSign, Activity, Users, Briefcase, Zap, FileText, MessageSquare, Plus, Mail } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

export const PipelineView = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  const handleAskAgent = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chatbot'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">{t('dashboard.views.backToDashboard')}</button>
          <ChevronRight size={16} className="text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-800">{t('dashboard.views.pipelineWip')}</h2>
        </div>
        <div className="flex gap-2">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
            <Plus size={16} /> {t('dashboard.views.newDeal')}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Commit', 'Closed'].map((stage, idx) => (
            <div key={stage} className="w-72 bg-slate-50 rounded-lg p-3 border border-slate-100 flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-700">{stage}</h3>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-medium">
                  {idx === 2 ? '2' : idx === 3 ? '1' : '0'}
                </span>
              </div>
              
              {idx === 2 && (
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-3 cursor-pointer hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-800 text-sm">Acme Corp Upgrade</h4>
                    <span className="text-emerald-600 font-bold text-sm">¥5M</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Close: Oct 15 • 40%</p>
                  <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded w-max mb-3">
                    <AlertCircle size={12} /> Pricing objection
                  </div>
                  <div className="text-xs text-slate-600 border-t pt-2 mt-2">
                    <span className="font-medium">Next:</span> Send revised proposal (Overdue)
                  </div>
                </div>
              )}
              {idx === 3 && (
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-800 text-sm">TechFlow Enterprise</h4>
                    <span className="text-emerald-600 font-bold text-sm">¥12M</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Close: Sep 30 • 70%</p>
                  <div className="text-xs text-slate-600 border-t pt-2 mt-2">
                    <span className="font-medium">Next:</span> Final legal review (Sep 28)
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">{t('dashboard.views.wipTable')}</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">{t('dashboard.views.viewAll')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t('dashboard.views.dealAccount')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.views.owner')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.views.nextAction')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.views.dueDate')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.views.agentSuggestion')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.views.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">Acme Corp Upgrade</td>
                <td className="px-4 py-3 text-slate-600">Kenji Sato</td>
                <td className="px-4 py-3 text-slate-600">Send revised proposal</td>
                <td className="px-4 py-3 text-red-600 font-medium">Yesterday</td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2 text-indigo-700 bg-indigo-50 p-2 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors" onClick={handleAskAgent}>
                    <Bot size={14} className="mt-0.5 flex-shrink-0" />
                    <span className="text-xs">Draft email with 10% discount option based on last meeting notes.</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={handleAskAgent} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Draft Email"><Mail size={16} /></button>
                    <button onClick={handleAskAgent} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Summarize"><MessageSquare size={16} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
