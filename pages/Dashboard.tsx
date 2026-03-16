import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Line, Bar, Tooltip, ResponsiveContainer,
  BarChart, LineChart, PieChart, Pie, Cell,
  FunnelChart, Funnel, LabelList, XAxis, YAxis, CartesianGrid, Legend, ComposedChart
} from 'recharts';
import { Search, Bell, Bot, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, DollarSign, Activity, Briefcase, Zap, FileText, Mail, Building, Calendar, Globe, Package, RotateCcw, SlidersHorizontal, MapPin, Database, Tag, Filter, Users, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/cn';

import { RevenueView } from '../components/dashboard/RevenueView';
import { PipelineView } from '../components/dashboard/PipelineView';
import { AccountsView } from '../components/dashboard/AccountsView';
import { PnLView } from '../components/dashboard/PnLView';
import { ReportsView } from '../components/dashboard/ReportsView';

import { INDUSTRIES, KPI_GROUPS, KPI_ITEMS } from '../data/kpiData';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const GROUP_COLORS = [
  { bg: 'bg-indigo-50/40', headerBg: 'bg-indigo-100/60', text: 'text-indigo-900' },
  { bg: 'bg-emerald-50/40', headerBg: 'bg-emerald-100/60', text: 'text-emerald-900' },
  { bg: 'bg-amber-50/40', headerBg: 'bg-amber-100/60', text: 'text-amber-900' },
  { bg: 'bg-rose-50/40', headerBg: 'bg-rose-100/60', text: 'text-rose-900' },
  { bg: 'bg-cyan-50/40', headerBg: 'bg-cyan-100/60', text: 'text-cyan-900' }
];

const generateDummyData = (type: string) => {
  if (type === 'pie') {
    return [
      { name: 'A', value: 400 },
      { name: 'B', value: 300 },
      { name: 'C', value: 300 },
      { name: 'D', value: 200 },
    ];
  }
  return [
    { name: 'Jan', value: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Feb', value: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Mar', value: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Apr', value: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'May', value: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jun', value: Math.floor(Math.random() * 5000) + 1000 },
  ];
};

const funnelData = [
  { name: 'Lead', value: 1000, fill: '#6366f1' },
  { name: 'MQL', value: 800, fill: '#8b5cf6' },
  { name: 'SQL', value: 600, fill: '#ec4899' },
  { name: 'Proposal', value: 400, fill: '#f43f5e' },
  { name: 'Negotiation', value: 200, fill: '#f59e0b' },
  { name: 'Won', value: 100, fill: '#10b981' },
];

const conversionByMonthData = [
  { month: 'Jan', rate: 12 },
  { month: 'Feb', rate: 15 },
  { month: 'Mar', rate: 14 },
  { month: 'Apr', rate: 18 },
  { month: 'May', rate: 22 },
  { month: 'Jun', rate: 25 },
];

const leadSourceData = [
  { name: 'Organic', value: 400 },
  { name: 'Direct', value: 300 },
  { name: 'Referral', value: 200 },
  { name: 'Social', value: 100 },
];

const salesRepData = [
  { name: 'Alice', won: 45, lost: 10 },
  { name: 'Bob', won: 30, lost: 15 },
  { name: 'Charlie', won: 20, lost: 5 },
  { name: 'Diana', won: 15, lost: 20 },
];

const wipVsPlanData = [
  { month: 'Jan', wip: 4200, plan: 4500, isYTD: true },
  { month: 'Feb', wip: 3500, plan: 3800, isYTD: true },
  { month: 'Mar', wip: 4800, plan: 4500, isYTD: true },
  { month: 'Apr', wip: 5100, plan: 5000, isYTD: false },
  { month: 'May', wip: 5900, plan: 6000, isYTD: false },
  { month: 'Jun', wip: 6800, plan: 6500, isYTD: false },
  { month: 'Jul', wip: 7200, plan: 7000, isYTD: false },
  { month: 'Aug', wip: 6500, plan: 6800, isYTD: false },
  { month: 'Sep', wip: 7800, plan: 7500, isYTD: false },
  { month: 'Oct', wip: 8100, plan: 8000, isYTD: false },
  { month: 'Nov', wip: 8900, plan: 8500, isYTD: false },
  { month: 'Dec', wip: 9500, plan: 9000, isYTD: false },
];

const KpiWidget = React.memo(({ kpi, chartType, t, filters }: { kpi: any, chartType: string, t: any, filters?: any }) => {
  const data = React.useMemo(() => generateDummyData(chartType), [chartType, filters]);
  const value = React.useMemo(() => Math.floor(Math.random() * 10000) + 1000, [filters]);
  const trend = React.useMemo(() => Math.floor(Math.random() * 20) - 10, [filters]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col h-full min-h-[160px]">
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors line-clamp-1" title={t(`dashboard.kpi.${kpi.id}`) !== `dashboard.kpi.${kpi.id}` ? t(`dashboard.kpi.${kpi.id}`) : kpi.name}>{t(`dashboard.kpi.${kpi.id}`) !== `dashboard.kpi.${kpi.id}` ? t(`dashboard.kpi.${kpi.id}`) : kpi.name}</p>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap font-mono", trend >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50")}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      </div>

      {chartType === 'card' && (
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-3xl font-black text-slate-800 font-mono">{value.toLocaleString()}</h3>
          <p className="text-xs font-medium text-slate-400 mt-2">{kpi.code}</p>
        </div>
      )}

      {chartType === 'line' && (
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-2 font-mono">{value.toLocaleString()}</h3>
          <div className="flex-1 min-h-[80px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartType === 'bar' && (
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-2 font-mono">{value.toLocaleString()}</h3>
          <div className="flex-1 min-h-[80px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Bar dataKey="value" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartType === 'pie' && (
        <div className="flex-1 flex items-center">
          <div className="w-1/2">
            <h3 className="text-xl font-black text-slate-800 font-mono">{value.toLocaleString()}</h3>
            <p className="text-xs font-medium text-slate-400 mt-1">{kpi.code}</p>
          </div>
          <div className="w-1/2 h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={24} outerRadius={36} paddingAngle={2} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartType === 'table' && (
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-3 font-mono">{value.toLocaleString()}</h3>
          <div className="space-y-2 mt-auto">
            {data.slice(0, 3).map((d: any, i: number) => (
              <div key={i} className="flex justify-between text-xs items-center">
                <span className="text-slate-500 font-medium">{d.name}</span>
                <span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export const Dashboard = () => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // Filter states
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [dashboardFiltersConfig, setDashboardFiltersConfig] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [industryId, setIndustryId] = useState('mfg');
  const [configuredKpis, setConfiguredKpis] = useState<any[]>([]);

  useEffect(() => {
    const savedFiltersStr = localStorage.getItem('dashboard_filters');
    let config: any[] = [];
    if (savedFiltersStr) {
      try {
        const parsedFilters = JSON.parse(savedFiltersStr);
        config = parsedFilters.filter((f: any) => f.enabled);
      } catch (e) {
        console.error('Failed to parse dashboard filters');
      }
    }

    if (config.length === 0) {
      config = [
        { id: 'month', name: 'Month', type: 'standard', options: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
        { id: 'location', name: 'Location', type: 'standard', options: ['Hanoi', 'Ho Chi Minh City', 'Da Nang'] },
        { id: 'product', name: 'Product', type: 'standard', options: ['Product A', 'Product B', 'Product C'] },
      ];
    }

    setDashboardFiltersConfig(config);

    const initialFilters: Record<string, string> = {};
    config.forEach((f: any) => {
      if (f.options && f.options.length > 0) {
        initialFilters[f.id] = f.options[0];
      }
    });
    setActiveFilters(initialFilters);

    const tenantSettingsStr = localStorage.getItem('tenant_settings');
    let savedIndustry = 'mfg';
    if (tenantSettingsStr) {
      try {
        const settings = JSON.parse(tenantSettingsStr);
        if (settings.industry) savedIndustry = settings.industry;
      } catch (e) {}
    }
    setIndustryId(savedIndustry);

    const savedSelectionsStr = localStorage.getItem('dashboard_kpi_selections');
    let selections: Record<string, any> = {};
    if (savedSelectionsStr) {
      try {
        selections = JSON.parse(savedSelectionsStr);
      } catch (e) {}
    }

    const groups = KPI_GROUPS.filter(g => g.industryId === savedIndustry);
    const kpis = KPI_ITEMS.filter(k => groups.some(g => g.id === k.groupId));

    const activeKpis = kpis.filter(k => {
      const sel = selections[k.id];
      if (sel) return sel.visible;
      return k.defaultVisible;
    }).map(k => ({
      ...k,
      displayOrder: selections[k.id]?.displayOrder ?? 999,
      chartType: selections[k.id]?.chartType || k.chartType
    })).sort((a, b) => a.displayOrder - b.displayOrder);

    setConfiguredKpis(activeKpis);
  }, []);

  const groupedKpis = React.useMemo(() => {
    return KPI_GROUPS.filter(g => g.industryId === industryId).map(group => ({
      ...group,
      kpis: configuredKpis.filter(k => k.groupId === group.id)
    })).filter(g => g.kpis.length > 0);
  }, [industryId, configuredKpis]);

  const industryName = React.useMemo(() => {
    const ind = INDUSTRIES.find(i => i.id === industryId);
    return ind ? (t(`industry.${ind.id}`) !== `industry.${ind.id}` ? t(`industry.${ind.id}`) : ind.name) : 'Dashboard';
  }, [industryId, t]);

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
          title: t('dashboard.revenueAlert'),
          message: t('dashboard.revenueAlertDesc').replace('{revenue}', metrics.revenue.toString()).replace('{target}', metrics.target.toString()),
          actionLabel: t('dashboard.viewRecoveryPlan'),
          onAction: () => {
            window.dispatchEvent(new CustomEvent('open-ai-chatbot', {
              detail: { initialMessage: t('dashboard.revenueAlertBotMsg') }
            }));
          }
        }
      });
      window.dispatchEvent(event);
    }
  }, [metrics.revenue, metrics.target, t]);

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

  const getFilterIcon = (id: string) => {
    switch (id) {
      case 'month':
      case 'quarter':
      case 'time': return Calendar;
      case 'location': return Globe;
      case 'department': return Users;
      case 'product': return Package;
      case 'customer_segment': return Briefcase;
      case 'sales_channel': return Tag;
      case 'status': return Activity;
      case 'marketing_campaign': return Briefcase;
      case 'distribution_channel': return Users;
      default: return Filter;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    const resetFilters: Record<string, string> = {};
    dashboardFiltersConfig.forEach(f => {
      if (f.options && f.options.length > 0) {
        resetFilters[f.id] = f.options[0];
      }
    });
    setActiveFilters(resetFilters);
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
      <header className="flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative z-30">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {dashboardFiltersConfig.map(filter => {
              const Icon = getFilterIcon(filter.id);
              return (
                <div key={filter.id} className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-white transition-all group shadow-sm">
                  <div className="pl-3 pr-1 py-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Icon size={16} />
                  </div>
                  <select
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => setActiveFilters({...activeFilters, [filter.id]: e.target.value})}
                    className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer py-2 pl-1 pr-8 appearance-none w-full min-w-[130px]"
                  >
                    {filter.options?.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              );
            })}

            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              title={t('dashboard.filters.reset') || 'Reset Filters'}
            >
              <RotateCcw size={16} />
            </button>

            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200">
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">{t('dashboard.filters.more') || 'More Filters'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-64" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={t('dashboard.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
              />

              {/* Search Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 w-full xl:w-80 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('dashboard.searchAccounts')}</div>
                      <button className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                        <Building size={14} className="text-indigo-500" /> {t('dashboard.searchTechFlowEnt')}
                      </button>
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">{t('dashboard.searchDeals')}</div>
                      <button className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                        <Briefcase size={14} className="text-emerald-500" /> {t('dashboard.searchTechFlowQ3')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden xl:block"></div>

            <button
              onClick={handleAskAgent}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all whitespace-nowrap"
            >
              <Bot size={16} /> <span className="hidden sm:inline">{t('dashboard.askAgent')}</span>
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
                      <h4 className="font-semibold text-slate-800">{t('dashboard.notifications')}</h4>
                      <button className="text-xs text-indigo-600 font-medium hover:underline">{t('dashboard.markAllRead')}</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3">
                        <div className="mt-0.5 text-amber-500"><AlertCircle size={16} /></div>
                        <div>
                          <p className="text-sm text-slate-800 font-medium">{t('dashboard.notif1Title')}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{t('dashboard.notif1Desc')}</p>
                          <p className="text-xs text-slate-400 mt-1">{t('dashboard.notif1Time')}</p>
                        </div>
                      </div>
                      <div className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3">
                        <div className="mt-0.5 text-emerald-500"><CheckCircle2 size={16} /></div>
                        <div>
                          <p className="text-sm text-slate-800 font-medium">{t('dashboard.notif2Title')}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{t('dashboard.notif2Desc')}</p>
                          <p className="text-xs text-slate-400 mt-1">{t('dashboard.notif2Time')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                      <button className="text-sm text-slate-600 font-medium hover:text-indigo-600">{t('dashboard.viewAll') !== 'dashboard.viewAll' ? t('dashboard.viewAll') : 'View All'}</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Agent Insights + Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Bot size={18} />
            </div>
            <h3 className="font-bold text-slate-800">{t('dashboard.agentInsights')}</h3>
          </div>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">{t('dashboard.updatedAgo')}</span>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-red-500"><AlertCircle size={16} /></div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">{t('dashboard.insight1')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><FileText size={12}/> Q3_Forecast.xlsx</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-amber-500"><AlertCircle size={16} /></div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">{t('dashboard.insight2')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><FileText size={12}/> CRM_Export.csv</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-emerald-500"><CheckCircle2 size={16} /></div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">{t('dashboard.insight3')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><Mail size={12}/> Email_Thread_TechFlow</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <button onClick={() => setActiveView('reports')} className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 shadow-sm">
              <FileText size={16} className="text-indigo-600" /> {t('dashboard.generateReport')}
            </button>
            <button onClick={handleAskAgent} className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 shadow-sm">
              <TrendingUp size={16} className="text-emerald-600" /> {t('dashboard.createRecoveryPlan')}
            </button>
            <button onClick={handleAskAgent} className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 shadow-sm">
              <Mail size={16} className="text-blue-600" /> {t('dashboard.sendFollowUps')}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">{t('dashboard.revenue')}</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><DollarSign size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">$12.4M</div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-600 font-medium flex items-center"><TrendingUp size={14} className="mr-1" /> +12.5%</span>
            <span className="text-slate-400 ml-2">{t('dashboard.vsLastMonth')}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">{t('dashboard.grossProfit')}</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Activity size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">$4.2M</div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-600 font-medium flex items-center"><TrendingUp size={14} className="mr-1" /> +8.2%</span>
            <span className="text-slate-400 ml-2">{t('dashboard.vsLastMonth')}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">{t('dashboard.grossMargin')}</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Zap size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">33.8%</div>
          <div className="flex items-center text-sm">
            <span className="text-rose-600 font-medium flex items-center"><TrendingDown size={14} className="mr-1" /> -1.2%</span>
            <span className="text-slate-400 ml-2">{t('dashboard.vsLastMonth')}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">{t('dashboard.achievement')}</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle2 size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">94.5%</div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-600 font-medium flex items-center"><TrendingUp size={14} className="mr-1" /> +2.1%</span>
            <span className="text-slate-400 ml-2">{t('dashboard.vsPlan')}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">{t('dashboard.growthYoY')}</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">18.2%</div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-600 font-medium flex items-center"><TrendingUp size={14} className="mr-1" /> +4.5%</span>
            <span className="text-slate-400 ml-2">{t('dashboard.vsLastYear')}</span>
          </div>
        </div>
      </div>

      {/* WIP vs Plan Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">{t('dashboard.wipVsPlan')}</h2>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200 flex items-center gap-1">
              <Database size={12} /> Using Uploaded Plan Data
            </span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={wipVsPlanData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="wip" name={t('dashboard.wipActual')} radius={[4, 4, 0, 0]} barSize={40}>
                {wipVsPlanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isYTD ? '#6366f1' : '#c7d2fe'} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="plan" name={t('dashboard.plan')} stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dynamic KPI Groups */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">{t('dashboard.overview')} - {industryName}</h2>
        <button
          onClick={() => setMetrics(prev => ({ ...prev, revenue: 95 }))}
          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1 font-medium"
        >
          <AlertCircle size={14} /> {t('dashboard.simulateRevenueDrop')}
        </button>
      </div>
      <div className="space-y-6">
        {groupedKpis.map((group, groupIdx) => {
          const colorClass = GROUP_COLORS[groupIdx % GROUP_COLORS.length];
          return (
            <div key={group.id} className={cn("rounded-2xl overflow-hidden relative", colorClass.bg)}>
              <div className={cn("px-5 py-3 flex items-center justify-between", colorClass.headerBg)}>
                <h3 className={cn("font-bold", colorClass.text)}>
                  {t(`group.${group.id}`) !== `group.${group.id}` ? t(`group.${group.id}`) : group.name}
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.kpis.map((kpi: any) => (
                    <KpiWidget key={kpi.id} kpi={kpi} chartType={kpi.chartType as string} t={t} filters={activeFilters} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Funnel Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">{t('dashboard.salesFunnel')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">{t('dashboard.salesPipelineFunnel')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">{t('dashboard.conversionRate')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">{t('dashboard.perfByLeadSource')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">{t('dashboard.perfBySalesRep')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesRepData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="won" name="Won" stackId="a" fill="#10b981" barSize={20} />
                  <Bar dataKey="lost" name="Lost" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};
