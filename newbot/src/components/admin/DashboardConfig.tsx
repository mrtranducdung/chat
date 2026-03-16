import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, ChevronRight, Search, Save, RotateCcw, X, 
  LayoutDashboard, BarChart3, LineChart, PieChart, Table2, 
  ArrowLeft, ArrowRight, Maximize2, Minimize2, Trash2, Plus
} from 'lucide-react';
import { INDUSTRIES, KPI_GROUPS, KPI_ITEMS } from '../../data/kpiData';
import { 
  LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, 
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

// Mock data for charts
const mockDataLine = [
  { name: 'Jan', value: 400 }, { name: 'Feb', value: 300 }, { name: 'Mar', value: 550 },
  { name: 'Apr', value: 450 }, { name: 'May', value: 700 }, { name: 'Jun', value: 650 }
];
const mockDataBar = [
  { name: 'Q1', value: 4000 }, { name: 'Q2', value: 3000 }, 
  { name: 'Q3', value: 5000 }, { name: 'Q4', value: 7000 }
];
const mockDataPie = [
  { name: 'A', value: 400 }, { name: 'B', value: 300 }, 
  { name: 'C', value: 300 }, { name: 'D', value: 200 }
];
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

interface KpiSelection {
  visible: boolean;
  displayOrder: number;
  chartType: string;
  size: '1x1' | '2x1' | '2x2';
}

import { useLanguage } from '../../context/LanguageContext';

export const DashboardConfig = () => {
  const { t } = useLanguage();
  const [selectedIndustry, setSelectedIndustry] = useState(() => {
    const tenantSettings = localStorage.getItem('tenant_settings');
    if (tenantSettings) {
      try {
        return JSON.parse(tenantSettings).industry || INDUSTRIES[0].id;
      } catch (e) {
        return INDUSTRIES[0].id;
      }
    }
    return INDUSTRIES[0].id;
  });

  // Listen for changes to tenant_settings
  useEffect(() => {
    const handleStorageChange = () => {
      const tenantSettings = localStorage.getItem('tenant_settings');
      if (tenantSettings) {
        try {
          const parsed = JSON.parse(tenantSettings);
          if (parsed.industry && parsed.industry !== selectedIndustry) {
            setSelectedIndustry(parsed.industry);
          }
        } catch (e) {}
      }
    };
    
    // Initial check
    handleStorageChange();
    
    // Listen for storage events (if changed in another tab)
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedIndustry]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['mfg-g1']);
  
  const [selections, setSelections] = useState<Record<string, KpiSelection>>(() => {
    const saved = localStorage.getItem('dashboard_kpi_selections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure size exists for backward compatibility
        Object.keys(parsed).forEach(key => {
          if (!parsed[key].size) {
            parsed[key].size = ['line', 'bar', 'table'].includes(parsed[key].chartType) ? '2x1' : '1x1';
          }
        });
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved KPIs', e);
      }
    }
    
    const initial: Record<string, KpiSelection> = {};
    KPI_ITEMS.forEach((kpi, index) => {
      initial[kpi.id] = {
        visible: kpi.defaultVisible,
        displayOrder: index,
        chartType: kpi.chartType,
        size: ['line', 'bar', 'table'].includes(kpi.chartType) ? '2x1' : '1x1'
      };
    });
    return initial;
  });

  useEffect(() => {
    const groups = KPI_GROUPS.filter(g => g.industryId === selectedIndustry);
    if (groups.length > 0) {
      setExpandedGroups([groups[0].id]);
    }
  }, [selectedIndustry]);

  const currentGroups = KPI_GROUPS.filter(g => g.industryId === selectedIndustry);
  const currentKpis = KPI_ITEMS.filter(k => currentGroups.some(g => g.id === k.groupId));

  const visibleKpis = useMemo(() => {
    return currentKpis
      .filter(k => selections[k.id]?.visible)
      .sort((a, b) => (selections[a.id]?.displayOrder || 0) - (selections[b.id]?.displayOrder || 0));
  }, [currentKpis, selections]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleAddKpi = (kpiId: string) => {
    const maxOrder = Math.max(0, ...Object.values(selections).map((s: any) => s.displayOrder || 0));
    setSelections(prev => ({
      ...prev,
      [kpiId]: { 
        ...prev[kpiId], 
        visible: true, 
        displayOrder: maxOrder + 1 
      }
    }));
  };

  const handleRemoveKpi = (kpiId: string) => {
    setSelections(prev => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], visible: false }
    }));
  };

  const handleMoveKpi = (kpiId: string, direction: 'left' | 'right') => {
    const currentIndex = visibleKpis.findIndex(k => k.id === kpiId);
    if (
      (direction === 'left' && currentIndex === 0) || 
      (direction === 'right' && currentIndex === visibleKpis.length - 1)
    ) return;

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    const targetKpiId = visibleKpis[targetIndex].id;

    setSelections(prev => {
      const newSelections = { ...prev };
      const tempOrder = newSelections[kpiId].displayOrder;
      newSelections[kpiId].displayOrder = newSelections[targetKpiId].displayOrder;
      newSelections[targetKpiId].displayOrder = tempOrder;
      return newSelections;
    });
  };

  const handleUpdateKpi = (kpiId: string, updates: Partial<KpiSelection>) => {
    setSelections(prev => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], ...updates }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('dashboard_kpi_selections', JSON.stringify(selections));
    alert(t('admin.configSaved'));
  };

  const handleReset = () => {
    if (confirm('Reset to industry defaults?')) {
      const resetState: Record<string, KpiSelection> = {};
      currentKpis.forEach((kpi, index) => {
        resetState[kpi.id] = {
          visible: kpi.defaultVisible,
          displayOrder: index,
          chartType: kpi.chartType,
          size: ['line', 'bar', 'table'].includes(kpi.chartType) ? '2x1' : '1x1'
        };
      });
      setSelections(prev => ({ ...prev, ...resetState }));
    }
  };

  const renderMockChart = (type: string) => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={mockDataLine}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockDataBar}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie data={mockDataPie} innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                {mockDataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <div className="w-full h-full flex flex-col justify-center">
            <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
            <div className="w-3/4 h-2 bg-slate-100 rounded mb-2"></div>
            <div className="w-5/6 h-2 bg-slate-100 rounded mb-2"></div>
            <div className="w-1/2 h-2 bg-slate-100 rounded"></div>
          </div>
        );
      case 'card':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-3xl font-bold text-slate-800">1,234</span>
            <span className="text-sm text-emerald-500 font-medium flex items-center mt-1">
              +12.5% <ArrowRight size={14} className="-rotate-45 ml-1" />
            </span>
          </div>
        );
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{t('admin.dashboardBuilder')}</h2>
            <p className="text-xs text-slate-500">{t('admin.designPerfectView')}</p>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">{t('admin.industryLabel')}</span>
            <span className="text-sm font-bold text-slate-700">{t(`industry.${selectedIndustry}`) !== `industry.${selectedIndustry}` ? t(`industry.${selectedIndustry}`) : INDUSTRIES.find(i => i.id === selectedIndustry)?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleReset} className="flex-1 sm:flex-none px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <RotateCcw size={16} /> {t('admin.resetDefault')}
          </button>
          <button onClick={handleSave} className="flex-1 sm:flex-none px-6 py-2 flex items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
            <Save size={16} /> {t('admin.saveLayout')}
          </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Pane: KPI Library */}
        <div className="w-full lg:w-80 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 mb-3">{t('admin.kpiLibrary')}</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={t('admin.searchMetrics')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {currentGroups.map(group => {
              const groupKpis = currentKpis.filter(k => k.groupId === group.id && k.name.toLowerCase().includes(searchQuery.toLowerCase()));
              if (groupKpis.length === 0) return null;
              
              const isExpanded = expandedGroups.includes(group.id);

              return (
                <div key={group.id} className="border border-slate-100 rounded-xl overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
                      <h4 className="font-semibold text-sm text-slate-700">{t(`dashboard.group.${group.id}`) !== `dashboard.group.${group.id}` ? t(`dashboard.group.${group.id}`) : group.name}</h4>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {groupKpis.length}
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="divide-y divide-slate-50 bg-white"
                      >
                        {groupKpis.map(kpi => {
                          const isSelected = selections[kpi.id]?.visible;
                          return (
                            <div key={kpi.id} className="p-3 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                              <div className="flex-1 pr-2">
                                <p className="text-sm font-medium text-slate-800 line-clamp-1">{t(`dashboard.kpi.${kpi.id}`) !== `dashboard.kpi.${kpi.id}` ? t(`dashboard.kpi.${kpi.id}`) : kpi.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{kpi.code}</p>
                              </div>
                              <button
                                onClick={() => isSelected ? handleRemoveKpi(kpi.id) : handleAddKpi(kpi.id)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500' 
                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                                }`}
                                title={isSelected ? "Remove from dashboard" : "Add to dashboard"}
                              >
                                {isSelected ? <Trash2 size={14} /> : <Plus size={16} />}
                              </button>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Live Layout Builder */}
        <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="font-bold text-slate-800">{t('admin.livePreview')}</h3>
            </div>
            <span className="text-sm text-slate-500 font-medium">{t('admin.widgetsActive').replace('{count}', visibleKpis.length.toString())}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {visibleKpis.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <LayoutDashboard size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium text-slate-500">{t('admin.dashboardEmpty')}</p>
                <p className="text-sm">{t('admin.addKpisToStart')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-[160px]">
                <AnimatePresence mode="popLayout">
                  {visibleKpis.map((kpi, index) => {
                    const sel = selections[kpi.id];
                    const colSpanClass = 
                      sel.size === '2x2' ? 'col-span-1 md:col-span-2 row-span-2' :
                      sel.size === '2x1' ? 'col-span-1 md:col-span-2 row-span-1' :
                      'col-span-1 row-span-1';

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        key={kpi.id}
                        className={`group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col ${colSpanClass}`}
                      >
                        {/* Widget Header */}
                        <div className="px-4 pt-4 pb-2 flex justify-between items-start shrink-0">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{t(`dashboard.kpi.${kpi.id}`) !== `dashboard.kpi.${kpi.id}` ? t(`dashboard.kpi.${kpi.id}`) : kpi.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">{kpi.code}</p>
                          </div>
                          
                          {/* Hover Controls */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-slate-100 absolute top-3 right-3 z-10">
                            <button onClick={() => handleMoveKpi(kpi.id, 'left')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-30">
                              <ArrowLeft size={14} />
                            </button>
                            <button onClick={() => handleMoveKpi(kpi.id, 'right')} disabled={index === visibleKpis.length - 1} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-30">
                              <ArrowRight size={14} />
                            </button>
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            <button onClick={() => handleRemoveKpi(kpi.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Widget Content (Mock Chart) */}
                        <div className="flex-1 px-4 pb-4 min-h-0 relative">
                          {renderMockChart(sel.chartType)}
                        </div>

                        {/* Bottom Controls (Always visible on hover) */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-white via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                          
                          {/* Chart Type Selector */}
                          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-sm">
                            {[
                              { type: 'card', icon: LayoutDashboard },
                              { type: 'line', icon: LineChart },
                              { type: 'bar', icon: BarChart3 },
                              { type: 'pie', icon: PieChart },
                              { type: 'table', icon: Table2 }
                            ].map(ct => (
                              <button
                                key={ct.type}
                                onClick={() => handleUpdateKpi(kpi.id, { chartType: ct.type })}
                                className={`p-1.5 rounded-md transition-colors ${sel.chartType === ct.type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                title={`Change to ${ct.type}`}
                              >
                                <ct.icon size={14} />
                              </button>
                            ))}
                          </div>

                          {/* Size Selector */}
                          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-sm">
                            {[
                              { size: '1x1', icon: Minimize2, label: 'Small' },
                              { size: '2x1', icon: Maximize2, label: 'Wide' },
                              { size: '2x2', icon: LayoutDashboard, label: 'Large' }
                            ].map(sz => (
                              <button
                                key={sz.size}
                                onClick={() => handleUpdateKpi(kpi.id, { size: sz.size as any })}
                                className={`p-1.5 rounded-md transition-colors ${sel.size === sz.size ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                title={`Size: ${sz.label}`}
                              >
                                <sz.icon size={14} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
