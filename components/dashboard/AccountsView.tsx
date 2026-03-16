import React from 'react';
import { ChevronRight, Search, Bot, Building, MessageSquare, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const AccountsView = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  const handleAskAgent = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chatbot'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">Back to Dashboard</button>
          <ChevronRight size={16} className="text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-800">{t('dashboard.views.accounts360')}</h2>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder={t('dashboard.views.searchAccounts')} className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-1">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">{t('dashboard.views.topAccounts')}</div>
          <div className="divide-y divide-slate-100">
            {[
              { name: 'TechFlow Enterprise', rev: '¥45M', health: 'Green', last: '2 days ago' },
              { name: 'Acme Corp', rev: '¥22M', health: 'Amber', last: '1 week ago' },
              { name: 'Global Logistics', rev: '¥18M', health: 'Green', last: '3 days ago' },
            ].map((acc, idx) => (
              <div key={idx} className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-800">{acc.name}</h4>
                  <span className={`w-2 h-2 rounded-full mt-1.5 ${acc.health === 'Green' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>YTD: {acc.rev}</span>
                  <span>Last: {acc.last}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-2 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Building className="text-indigo-600" /> TechFlow Enterprise
              </h3>
              <p className="text-sm text-slate-500 mt-1">Enterprise Software • Tokyo, Japan</p>
            </div>
            <button onClick={handleAskAgent} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-2">
              <Bot size={16} /> {t('dashboard.views.accountPlanGen')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{t('dashboard.views.revenueYTD')}</p>
              <h4 className="text-xl font-bold text-slate-900">¥45M</h4>
              <span className="text-xs text-emerald-600 font-medium">+15% vs LY</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{t('dashboard.views.openPipeline')}</p>
              <h4 className="text-xl font-bold text-slate-900">¥12M</h4>
              <span className="text-xs text-slate-500 font-medium">2 active deals</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{t('dashboard.views.healthScore')}</p>
              <h4 className="text-xl font-bold text-emerald-600">92/100</h4>
              <span className="text-xs text-slate-500 font-medium">Excellent</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 border-b pb-2">{t('dashboard.views.recentInteractions')}</h4>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Q3 Review Meeting</p>
                  <p className="text-xs text-slate-500 mb-1">2 days ago • Kenji Sato</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    Discussed expansion to Osaka office. Client is happy with current performance. Need to send proposal by Friday.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3 border-b pb-2">Documents & Citations</h4>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <FileText size={16} className="text-red-500" /> TechFlow_Contract_v2.pdf
                </div>
                <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <FileText size={16} className="text-blue-500" /> Q3_Review_Deck.pptx
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
