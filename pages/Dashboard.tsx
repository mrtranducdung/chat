import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart
} from 'recharts';
import { Search, Bell, Bot, ChevronRight, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, FileText, Mail, Building } from 'lucide-react';
import { cn } from '../utils/cn';

import { RevenueView } from '../components/dashboard/RevenueView';
import { PipelineView } from '../components/dashboard/PipelineView';
import { AccountsView } from '../components/dashboard/AccountsView';
import { PnLView } from '../components/dashboard/PnLView';
import { ReportsView } from '../components/dashboard/ReportsView';

const revenueTrendData = [
  { name: 'Jan', actual: 4000, plan: 4200 },
  { name: 'Feb', actual: 3000, plan: 3500 },
  { name: 'Mar', actual: 2000, plan: 2500 },
  { name: 'Apr', actual: 2780, plan: 3000 },
  { name: 'May', actual: 1890, plan: 2000 },
  { name: 'Jun', actual: 2390, plan: 2500 },
  { name: 'Jul', actual: 3490, plan: 3500 },
  { name: 'Aug', actual: 4000, plan: 4200 },
  { name: 'Sep', actual: 3000, plan: 3500 },
];

const waterfallData = [
  { name: 'Closed Won', value: 120, fill: '#10b981' },
  { name: 'Slipped', value: -15, fill: '#f59e0b' },
  { name: 'Lost', value: -5, fill: '#ef4444' },
  { name: 'Upside Needed', value: 20, fill: '#6366f1' },
];

export const Dashboard = () => {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState({
    revenue: 120,
    target: 141,
    pipeline: 350,
    margin: 38.5
  });

  useEffect(() => {
    if (metrics.revenue < metrics.target * 0.8) {
      const event = new CustomEvent('proactive-trigger', {
        detail: {
          id: 'revenue_drop',
          type: 'warning',
          title: 'Revenue Alert',
          message: `Revenue has dropped to ¥${metrics.revenue}M, which is below 80% of the target (¥${metrics.target}M).`,
          actionLabel: 'View Recovery Plan',
          onAction: () => {
            window.dispatchEvent(new CustomEvent('open-ai-chatbot', {
              detail: { initialMessage: "I noticed the revenue drop. I've analyzed the pipeline and found 3 at-risk deals in Osaka. Would you like me to draft follow-up emails or generate a revised forecast?" }
            }));
          }
        }
      });
      window.dispatchEvent(event);
    }
  }, [metrics.revenue, metrics.target]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAskAgent = () => {
    window.dispatchEvent(new CustomEvent('open-ai-chatbot'));
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'revenue': return <RevenueView onClose={() => setActiveView(null)} />;
      case 'pipeline': return <PipelineView onClose={() => setActiveView(null)} />;
      case 'accounts': return <AccountsView onClose={() => setActiveView(null)} />;
      case 'pnl': return <PnLView onClose={() => setActiveView(null)} />;
      case 'reports': return <ReportsView onClose={() => setActiveView(null)} />;
      default: return null;
    }
  };

  if (activeView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10"
      >
        {renderActiveView()}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8 pb-24 md:pb-10 bg-slate-50/50 min-h-screen"
    >
      {/* Top Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative z-30">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex gap-2">
            <select className="bg-slate-50 border-none text-sm font-medium text-slate-700 rounded-lg focus:ring-0 cursor-pointer hover:bg-slate-100 py-2 px-3">
              <option>This Month</option>
              <option>Q3</option>
              <option>YTD</option>
              <option>Custom</option>
            </select>
            <select className="bg-slate-50 border-none text-sm font-medium text-slate-700 rounded-lg focus:ring-0 cursor-pointer hover:bg-slate-100 py-2 px-3">
              <option>All Teams</option>
              <option>Enterprise</option>
              <option>SMB</option>
            </select>
          </div>
          <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search accounts, deals, docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <AnimatePresence>
              {isSearchFocused && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-2">
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Accounts</div>
                    <button className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                      <Building size={14} className="text-indigo-500" /> TechFlow Enterprise
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAskAgent}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all"
          >
            <Bot size={16} /> Ask Agent
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-2 rounded-full relative transition-colors ${isNotificationsOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h4 className="font-semibold text-slate-800">Notifications</h4>
                    <button className="text-xs text-indigo-600 font-medium hover:underline">Mark all as read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3">
                      <div className="mt-0.5 text-amber-500"><AlertCircle size={16} /></div>
                      <div>
                        <p className="text-sm text-slate-800 font-medium">Deal at Risk</p>
                        <p className="text-xs text-slate-500 mt-0.5">Acme Corp Upgrade margin dropped below 25%.</p>
                        <p className="text-xs text-slate-400 mt-1">10 mins ago</p>
                      </div>
                    </div>
                    <div className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3">
                      <div className="mt-0.5 text-emerald-500"><CheckCircle2 size={16} /></div>
                      <div>
                        <p className="text-sm text-slate-800 font-medium">Report Generated</p>
                        <p className="text-xs text-slate-500 mt-0.5">Weekly Sales Report is ready for review.</p>
                        <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                    <button className="text-sm text-slate-600 font-medium hover:text-indigo-600">View All</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Overview</h2>
        <button
          onClick={() => setMetrics(prev => ({ ...prev, revenue: 95 }))}
          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1 font-medium"
        >
          <AlertCircle size={14} /> Simulate Revenue Drop
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div onClick={() => setActiveView('revenue')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Revenue</p>
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded", metrics.revenue >= metrics.target * 0.8 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50")}>
              {Math.round((metrics.revenue / metrics.target) * 100)}% Attn
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">¥{metrics.revenue}M</h3>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Plan: ¥{metrics.target}M</span>
            <span className="text-red-500 font-medium">Gap: -¥{metrics.target - metrics.revenue}M</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Forecast (EOM)</p>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1"><AlertCircle size={10}/> 92% Acc</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">¥135M</h3>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Commit: ¥110M</span>
            <span>Upside: ¥25M</span>
          </div>
        </div>

        <div onClick={() => setActiveView('pipeline')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Pipeline & WIP</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">2.5x Cov</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">¥350M</h3>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Weighted: ¥180M</span>
            <span className="text-amber-600 font-medium">7 Overdue</span>
          </div>
        </div>

        <div onClick={() => setActiveView('pnl')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Gross Margin</p>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1"><TrendingDown size={10}/> -2%</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">38.5%</h3>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Target: 40.5%</span>
            <span>GP: ¥46.2M</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div onClick={() => setActiveView('accounts')} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Accounts 360°</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">45 Active</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <Building size={16} />
            </div>
          </div>
          <div onClick={() => setActiveView('reports')} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Reports</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">2 Auto-gen</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <FileText size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Revenue Trend vs Plan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="actual" name="Actual (¥)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                <Line type="monotone" dataKey="plan" name="Plan (¥)" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Gap Decomposition</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Agent Insights */}
      <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Bot size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Agent Insights & Recommended Actions</h3>
          </div>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">Updated 5m ago</span>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-red-500"><AlertCircle size={16} /></div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Gap ¥12.4M JPY mainly due to 3 slipped deals in Osaka region.</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><FileText size={12}/> Q3_Forecast.xlsx</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-amber-500"><AlertCircle size={16} /></div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">WIP: 7 deals overdue on next step (Kenji Sato: 4, Yumi Tanaka: 3).</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><FileText size={12}/> CRM_Export.csv</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-emerald-500"><CheckCircle2 size={16} /></div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">TechFlow Enterprise shows strong signals from recent emails, likely to close this week.</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><Mail size={12}/> Email_Thread_TechFlow</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <button onClick={() => setActiveView('reports')} className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 shadow-sm">
              <FileText size={16} className="text-indigo-600" /> Generate Weekly Report
            </button>
            <button onClick={handleAskAgent} className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 shadow-sm">
              <TrendingUp size={16} className="text-emerald-600" /> Create Recovery Plan
            </button>
            <button onClick={handleAskAgent} className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 shadow-sm">
              <Mail size={16} className="text-blue-600" /> Send Follow-up Drafts
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
