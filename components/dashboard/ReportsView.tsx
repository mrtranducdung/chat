import React, { useState } from 'react';
import { ChevronRight, Bot, Plus, FileText, Download, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const ReportsView = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setIsSuccess(false);
    setTimeout(() => {
      setIsGenerating(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">Back to Dashboard</button>
          <ChevronRight size={16} className="text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-800">{t('dashboard.views.reportsTitle')}</h2>
        </div>
        <div className="flex gap-2">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
            <Plus size={16} /> {t('dashboard.views.newReport')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-semibold text-slate-800">{t('dashboard.views.reportLibrary')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Weekly Sales Report', last: '2 hours ago', recipients: 'LINE WORKS, Email', sources: 'M365, CRM', conf: 'High' },
              { title: 'Monthly Performance Review', last: '3 days ago', recipients: 'Email', sources: 'CRM, ERP', conf: 'High' },
              { title: 'Forecast Pack', last: '1 week ago', recipients: 'LINE WORKS', sources: 'CRM, Notes', conf: 'Med' },
              { title: 'Account Plan Pack', last: '2 weeks ago', recipients: 'Email', sources: 'M365, PDF', conf: 'Med' },
            ].map((report, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-slate-800">{report.title}</h4>
                  <FileText size={18} className="text-indigo-600" />
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <p><span className="font-medium text-slate-500">{t('dashboard.views.lastGenerated')}</span> {report.last}</p>
                  <p><span className="font-medium text-slate-500">{t('dashboard.views.recipients')}</span> {report.recipients}</p>
                  <p><span className="font-medium text-slate-500">{t('dashboard.views.sources')}</span> {report.sources}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${report.conf === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {t('dashboard.views.confidenceLabel')} {report.conf}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Download"><Download size={16} /></button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Send Now"><Send size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Bot className="text-indigo-600" /> {t('dashboard.views.reportBuilder')}
            </h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('dashboard.views.step1')}</label>
              <select className="w-full bg-white border border-slate-200 text-sm rounded-lg px-3 py-2">
                <option>Weekly Sales Summary</option>
                <option>Monthly Board Deck</option>
                <option>Custom Template</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('dashboard.views.step2')}</label>
              <div className="flex gap-2">
                <select className="w-1/2 bg-white border border-slate-200 text-sm rounded-lg px-3 py-2">
                  <option>All Teams</option>
                  <option>Enterprise</option>
                  <option>SMB</option>
                </select>
                <select className="w-1/2 bg-white border border-slate-200 text-sm rounded-lg px-3 py-2">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('dashboard.views.step3')}</label>
              <div className="space-y-2">
                {['Revenue', 'Gap Analysis', 'WIP Pipeline', 'P&L'].map((section) => (
                  <label key={section} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    {section}
                  </label>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex gap-2 flex-col">
              {isSuccess && (
                <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg text-sm flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} /> {t('dashboard.views.reportGenerated')}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  {t('dashboard.views.preview')}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <><Loader2 size={16} className="animate-spin" /> {t('dashboard.views.processing')}</> : t('dashboard.views.approveSend')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
