import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Bell, Bot, Filter, ChevronRight, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, DollarSign, Activity, Users, Briefcase, Zap, FileText, MessageSquare, Plus, Mail, Building, PieChart } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

export const PnLView = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  const [discount, setDiscount] = useState(10);
  const [slip, setSlip] = useState(1);

  const handleAskAgent = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chatbot'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">{t('dashboard.views.backToDashboard')}</button>
          <ChevronRight size={16} className="text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-800">P&L (Profitability for Sales)</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAskAgent} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-2">
            <Bot size={16} /> Recommend Pricing Moves
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Gross Profit YTD</p>
          <h3 className="text-3xl font-bold text-slate-900">¥42M</h3>
          <div className="flex items-center gap-2 mt-2 text-emerald-600 text-sm font-medium">
            <TrendingUp size={16} /> +12% vs Plan
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Gross Margin %</p>
          <h3 className="text-3xl font-bold text-slate-900">35%</h3>
          <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm font-medium">
            <TrendingDown size={16} /> -2% vs Plan
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Discount Impact</p>
          <h3 className="text-3xl font-bold text-red-600">-¥5.2M</h3>
          <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium">
            Avg Discount: 12%
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Delivery Cost Est.</p>
          <h3 className="text-3xl font-bold text-slate-900">¥18M</h3>
          <div className="flex items-center gap-2 mt-2 text-emerald-600 text-sm font-medium">
            <TrendingDown size={16} /> -5% vs Plan
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">Deal P&L Table (Active Pipeline)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Deal</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">COGS Est.</th>
                  <th className="px-4 py-3 font-medium">GM %</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">TechFlow Enterprise</td>
                  <td className="px-4 py-3">¥12M</td>
                  <td className="px-4 py-3">¥7.2M</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">40%</td>
                  <td className="px-4 py-3">5%</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Low</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">Acme Corp Upgrade</td>
                  <td className="px-4 py-3">¥5M</td>
                  <td className="px-4 py-3">¥4M</td>
                  <td className="px-4 py-3 text-red-600 font-medium">20%</td>
                  <td className="px-4 py-3">15%</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold flex items-center gap-1 w-max"><AlertCircle size={12}/> Margin &lt; 25%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <PieChart className="text-indigo-600" /> What-If Simulator
            </h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Discount Level: <span className="text-indigo-600">{discount}%</span></label>
              <input type="range" min="0" max="30" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>30%</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                Impact: GM drops to <span className="font-bold text-red-600">{38 - discount}%</span>. Revenue decreases by ¥{(discount * 0.12).toFixed(1)}M.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Close Date Slip: <span className="text-indigo-600">+{slip} Month{slip > 1 ? 's' : ''}</span></label>
              <input type="range" min="0" max="3" value={slip} onChange={(e) => setSlip(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0</span>
                <span>3m</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                Impact: Q3 Revenue shifts to Q4. Q3 attainment drops to <span className="font-bold text-red-600">{95 - (slip * 10)}%</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
