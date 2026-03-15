import React from 'react';
import { motion } from 'motion/react';
import { Search, Bell, Bot, Filter, ChevronRight, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, DollarSign, Activity, Users, Briefcase, Zap, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const RevenueView = ({ onClose }: { onClose: () => void }) => {
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
          <h2 className="text-xl font-semibold text-slate-800">{t('dashboard.views.revenueAnalysis')}</h2>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-1.5">
            <option>{t('dashboard.views.month')}</option>
            <option>{t('dashboard.views.quarter')}</option>
            <option>{t('dashboard.views.ytd')}</option>
          </select>
          <select className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-1.5">
            <option>{t('dashboard.views.byTeam')}</option>
            <option>{t('dashboard.views.byProduct')}</option>
            <option>{t('dashboard.views.byAccount')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">{t('dashboard.views.planVsActual')}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{t('dashboard.views.segment')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.views.plan')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.views.actual')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.views.gap')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.views.attainment')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.views.forecastEOM')}</th>
                  <th className="px-4 py-3 font-medium">{t('dashboard.views.confidence')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-800">Enterprise Team</td>
                  <td className="px-4 py-3">¥120M</td>
                  <td className="px-4 py-3">¥95M</td>
                  <td className="px-4 py-3 text-red-600">-¥25M</td>
                  <td className="px-4 py-3">79%</td>
                  <td className="px-4 py-3">¥110M</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">Med</span></td>
                </tr>
                <tr className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-800">SMB Team</td>
                  <td className="px-4 py-3">¥80M</td>
                  <td className="px-4 py-3">¥85M</td>
                  <td className="px-4 py-3 text-emerald-600">+¥5M</td>
                  <td className="px-4 py-3">106%</td>
                  <td className="px-4 py-3">¥90M</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">High</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">{t('dashboard.views.gapExplorer')}</div>
          <div className="p-4 space-y-4">
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-red-800 text-sm">{t('dashboard.views.slippedDeals')}</h4>
                <span className="text-red-600 font-bold text-sm">¥15M</span>
              </div>
              <p className="text-xs text-red-600 mb-3">{t('dashboard.views.reason')}: Budget frozen until Q4</p>
              <div className="flex gap-2">
                <button onClick={handleAskAgent} className="text-xs bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-50">
                  <Bot size={12} /> {t('dashboard.askAgent')}
                </button>
                <button className="text-xs bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50">
                  {t('dashboard.views.createTask')}
                </button>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-amber-800 text-sm">{t('dashboard.views.lowPipeline')}</h4>
                <span className="text-amber-600 font-bold text-sm">1.2x</span>
              </div>
              <p className="text-xs text-amber-600 mb-3">{t('dashboard.views.target')}: 3.0x remaining plan</p>
              <div className="flex gap-2">
                <button onClick={handleAskAgent} className="text-xs bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-50">
                  <Bot size={12} /> {t('dashboard.askAgent')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
