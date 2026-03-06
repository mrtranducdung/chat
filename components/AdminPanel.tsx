import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../services/i18n';
import {
  UploadIcon, TrashIcon, SettingsIcon, CodeIcon, MagicIcon, BarChartIcon,
  ThumbsUpIcon, ThumbsDownIcon, SearchIcon, PlusIcon, FileIcon, CheckCircleIcon, XIcon
} from './Icons';
import { KnowledgeItem, AppConfig, FeedbackLog, FeedbackAnalysisResult } from '../types';
import {
  getKnowledgeBase, saveKnowledgeItem, deleteKnowledgeItem,
  getConfig, saveConfig, getFeedbackLogs, analyzeFeedbackTrends
} from '../services/storageService';
import { analyzeDocument } from '../services/geminiService';
import EmbedCodeModal from './EmbedCodeModal';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'dashboard' | 'connectors' | 'knowledge' | 'feedback' | 'settings' | 'install';

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  revenueByMonth: { month: string; revenue: number }[];
  topProducts: { name: string; total_sold: number; revenue: number }[];
  revenueByRegion: { region: string; revenue: number }[];
  revenueByStaff: { name: string; revenue: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtVND = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B ₫`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M ₫`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K ₫`;
  return `${v} ₫`;
};
const fmtAxis = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  return `${v}`;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon }: any) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shrink-0`} style={{ background: color }}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminPanel: React.FC = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackLog[]>([]);
  const [config, setConfig] = useState<AppConfig>(getConfig());
  const [localConfig, setLocalConfig] = useState<AppConfig>(getConfig());
  const [newQuestion, setNewQuestion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [analysisResult, setAnalysisResult] = useState<FeedbackAnalysisResult | null>(null);
  const [isAnalyzingFeedback, setIsAnalyzingFeedback] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Dashboard state
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  // Connector state
  const [salesTestStatus, setSalesTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [connectorUrl, setConnectorUrl] = useState(getConfig().salesServiceUrl || '');

  // ── Fetch sales data ────────────────────────────────────────────────────────
  const fetchDashboard = async (url?: string) => {
    const base = url || config.salesServiceUrl;
    if (!base) { setDashboardError('Chưa cấu hình Sales Service URL. Vào tab Data Connectors để thêm.'); return; }
    setDashboardLoading(true);
    setDashboardError('');
    try {
      const res = await fetch(`${base}/api/sales/summary`);
      if (!res.ok) throw new Error('Sales service error');
      setSalesData(await res.json());
    } catch {
      setDashboardError('Không thể kết nối Sales Service. Kiểm tra lại URL trong Data Connectors.');
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboard();
  }, [activeTab]);

  // ── Fetch other data ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        if (activeTab === 'knowledge') setKnowledgeList(await getKnowledgeBase());
        else if (activeTab === 'feedback') setFeedbackLogs((await getFeedbackLogs()).sort((a, b) => b.timestamp - a.timestamp));
        const c = getConfig();
        setConfig(c); setLocalConfig(c);
      } catch (e) { console.error(e); }
      finally { setIsLoadingData(false); }
    };
    fetchData();
  }, [activeTab]);

  const filteredKnowledge = useMemo(() =>
    knowledgeList.filter(i =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.content.toLowerCase().includes(searchTerm.toLowerCase())
    ), [knowledgeList, searchTerm]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleRunFeedbackAnalysis = async () => {
    setIsAnalyzingFeedback(true);
    try { setAnalysisResult(await analyzeFeedbackTrends()); }
    catch { alert('Lỗi phân tích feedback'); }
    finally { setIsAnalyzingFeedback(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsProcessing(true); setUploadTitle(file.name);
    try {
      if (file.type === 'application/pdf') await handlePdfUpload(file);
      else await new Promise<void>((res, rej) => {
        const r = new FileReader();
        r.onload = (ev) => { setUploadText(ev.target?.result as string); res(); };
        r.onerror = rej; r.readAsText(file);
      });
    } catch { alert('Lỗi khi đọc file.'); }
    finally { setIsProcessing(false); }
  };

  const handlePdfUpload = async (file: File) => {
    // @ts-ignore
    if (!window.pdfjsLib) { alert('Thư viện PDF chưa tải xong.'); return; }
    const ab = await file.arrayBuffer();
    // @ts-ignore
    const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
    let txt = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      // @ts-ignore
      txt += tc.items.map(it => it.str).join(' ') + '\n\n';
    }
    setUploadText(txt);
  };

  const handleAnalyze = async () => {
    if (!uploadText.trim()) return alert('Vui lòng nhập nội dung.');
    setIsAnalyzing(true);
    try { setUploadTitle((await analyzeDocument(uploadText)).title); }
    catch { alert('Lỗi phân tích AI.'); }
    finally { setIsAnalyzing(false); }
  };

  const handleAddToKnowledge = async () => {
    if (!uploadTitle.trim() || !uploadText.trim()) return;
    setIsProcessing(true);
    try {
      setKnowledgeList(await saveKnowledgeItem({ id: '', tenantId: '', title: uploadTitle, content: uploadText, dateAdded: 0 }));
      setUploadTitle(''); setUploadText(''); setShowUpload(false);
      alert('Đã lưu vào server thành công!');
    } catch { alert('Lỗi khi lưu.'); }
    finally { setIsProcessing(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa tài liệu này?')) setKnowledgeList(await deleteKnowledgeItem(id));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setLocalConfig(p => ({ ...p, suggestedQuestions: [...(p.suggestedQuestions || []), newQuestion.trim()] }));
    setNewQuestion('');
  };

  const handleSaveConfig = () => {
    saveConfig(localConfig); setConfig(localConfig);
    alert('Cài đặt đã được lưu!'); window.location.reload();
  };

  const handleTestConnector = async () => {
    if (!connectorUrl) return;
    setSalesTestStatus('testing');
    try {
      const res = await fetch(`${connectorUrl}/api/sales/health`);
      setSalesTestStatus(res.ok ? 'ok' : 'error');
    } catch { setSalesTestStatus('error'); }
  };

  const handleSaveConnector = () => {
    const updated = { ...localConfig, salesServiceUrl: connectorUrl };
    saveConfig(updated); setConfig(updated); setLocalConfig(updated);
    alert('Đã lưu! Chuyển sang Dashboard để xem dữ liệu.');
    fetchDashboard(connectorUrl);
  };

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const SidebarItem = ({ id, label, icon }: { id: TabId; label: string; icon: string }) => (
    <button onClick={() => setActiveTab(id)}
      className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
        activeTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}>
      <span className="text-base">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  const navItems: { id: TabId; label: string; short: string; icon: string }[] = [
    { id: 'dashboard',  label: t.dashboard,      short: t.shortDashboard, icon: '📊' },
    { id: 'connectors', label: t.dataConnectors, short: t.shortConnectors, icon: '🔌' },
    { id: 'knowledge',  label: t.knowledgeBase,  short: t.shortKnowledge, icon: '📁' },
    { id: 'feedback',   label: t.feedback,       short: t.shortFeedback,  icon: '💬' },
    { id: 'settings',   label: t.settings,       short: t.shortSettings,  icon: '⚙️' },
    { id: 'install',    label: t.installGuide,   short: t.shortInstall,   icon: '📖' },
  ];

  return (
    <>
    <div className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row md:h-[860px]">

      {/* ── Mobile top nav ── */}
      <div className="md:hidden bg-white border-b border-gray-100 shrink-0">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-gray-900">Gemini<span className="text-blue-600">Admin</span></h2>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide px-2 pb-2 gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl shrink-0 transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] font-medium whitespace-nowrap">{item.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col p-5 z-10 shrink-0">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold text-gray-900">Gemini<span className="text-blue-600">Admin</span></h2>
          <p className="text-xs text-gray-400 mt-1">Enterprise Knowledge Hub</p>
        </div>
        <nav className="space-y-1 flex-1">
          <SidebarItem id="dashboard"   label={t.dashboard}      icon="📊" />
          <SidebarItem id="connectors"  label={t.dataConnectors} icon="🔌" />
          <SidebarItem id="knowledge"   label={t.knowledgeBase}  icon="📁" />
          <SidebarItem id="feedback"    label={t.feedback}       icon="💬" />
          <SidebarItem id="settings"    label={t.settings}       icon="⚙️" />
          <div className="pt-3 mt-3 border-t border-gray-100">
            <SidebarItem id="install"   label={t.installGuide}   icon="📖" />
          </div>
        </nav>
        <div className="mt-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500 text-sm">✅</div>
            <div>
              <p className="text-[10px] font-bold text-gray-700 uppercase">{t.systemStatus}</p>
              <p className="text-[10px] text-green-600">{t.allSystemsOk}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 bg-gray-50/50 overflow-y-auto">

        {/* ════════════════════ DASHBOARD TAB ════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.biDashboard}</h1>
                <p className="text-gray-400 text-sm mt-1">{t.realtimeSales}</p>
              </div>
              <button onClick={() => fetchDashboard()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm transition-all">
                {t.refresh}
              </button>
            </div>

            {dashboardLoading && (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                <p className="text-gray-400 animate-pulse">{t.loading}</p>
              </div>
            )}

            {dashboardError && !dashboardLoading && (
              <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
                <div className="text-5xl">🔌</div>
                <p className="text-gray-600 font-medium">{dashboardError}</p>
                <button onClick={() => setActiveTab('connectors')}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                  {t.configureConnector}
                </button>
              </div>
            )}

            {salesData && !dashboardLoading && (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard label={t.totalRevenue} value={fmtVND(salesData.totalRevenue)} sub={t.completedOrders} color="#3b82f6" icon="💰" />
                  <StatCard label={t.totalOrders} value={salesData.totalOrders.toLocaleString()} sub={t.completed} color="#10b981" icon="📦" />
                  <StatCard label={t.topProduct} value={salesData.topProducts[0]?.name?.split(' ').slice(0, 2).join(' ')} sub={fmtVND(salesData.topProducts[0]?.revenue)} color="#f59e0b" icon="🏆" />
                  <StatCard label={t.topRegion} value={salesData.revenueByRegion[0]?.region} sub={fmtVND(salesData.revenueByRegion[0]?.revenue)} color="#8b5cf6" icon="📍" />
                </div>

                {/* Row 1: Area chart + Pie chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  {/* Revenue over time */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-1">{t.revenueVsTrend}</h3>
                    <p className="text-xs text-gray-400 mb-4">{t.revenueByMonth}</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={salesData.revenueByMonth}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }}/>
                        <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} width={50}/>
                        <Tooltip formatter={(v: number) => [fmtVND(v), 'Doanh thu']}/>
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#3b82f6' }}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Revenue by region pie */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-1">{t.revenueByRegion}</h3>
                    <p className="text-xs text-gray-400 mb-4">{t.byRegion}</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={salesData.revenueByRegion} dataKey="revenue" nameKey="region"
                          cx="50%" cy="45%" outerRadius={70} innerRadius={35}
                          label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                          labelLine={false}>
                          {salesData.revenueByRegion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmtVND(v)}/>
                        <Legend wrapperStyle={{ fontSize: 11 }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Row 2: Top products bar + Staff bar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Top products */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-1">{t.topProducts}</h3>
                    <p className="text-xs text-gray-400 mb-4">{t.bestSelling}</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={salesData.topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/>
                        <XAxis type="number" tickFormatter={fmtAxis} tick={{ fontSize: 10 }}/>
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110}/>
                        <Tooltip formatter={(v: number) => fmtVND(v)}/>
                        <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                          {salesData.topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Staff performance */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-1">{t.staffPerformance}</h3>
                    <p className="text-xs text-gray-400 mb-4">{t.revenueByStaff}</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={salesData.revenueByStaff}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }}/>
                        <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 10 }} width={50}/>
                        <Tooltip formatter={(v: number) => fmtVND(v)}/>
                        <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]}>
                          {salesData.revenueByStaff.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════ DATA CONNECTORS TAB ════════════════════ */}
        {activeTab === 'connectors' && (
          <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.dataConnectorsTitle}</h1>
              <p className="text-gray-400 text-sm mt-1">{t.dataConnectorsDesc}</p>
            </div>

            {/* Sales Service Connector */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
              <div className="flex items-center gap-4 p-6 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0">📊</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{t.salesService}</h3>
                  <p className="text-sm text-gray-400">{t.salesServiceDesc}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  config.salesServiceUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {config.salesServiceUrl ? t.connected : t.notConfigured}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">{t.serverUrl}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={connectorUrl}
                      onChange={(e) => { setConnectorUrl(e.target.value); setSalesTestStatus('idle'); }}
                      placeholder="http://localhost:4000"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button onClick={handleTestConnector} disabled={salesTestStatus === 'testing' || !connectorUrl}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors whitespace-nowrap shadow-sm">
                      {salesTestStatus === 'testing'
                        ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>
                        : salesTestStatus === 'ok' ? t.testOk
                        : salesTestStatus === 'error' ? t.testFailed
                        : t.test}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {t.endpointsNote}
                  </p>
                </div>

                {/* Schema info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t.expectedEndpoints}</p>
                  <div className="space-y-1.5 text-xs font-mono">
                    {[
                      ['GET', '/api/sales/health', 'Health check'],
                      ['GET', '/api/sales/summary', 'Tổng hợp doanh thu, sản phẩm, khu vực, nhân viên'],
                    ].map(([m, path, desc]) => (
                      <div key={path} className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${m === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{m}</span>
                        <span className="text-blue-600">{path}</span>
                        <span className="text-gray-400">— {desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleSaveConnector} disabled={!connectorUrl}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50">
                  {t.saveConnect}
                </button>
              </div>
            </div>

            {/* Placeholder for future connectors */}
            {[
              { icon: '🗄️', name: 'PostgreSQL / MySQL', desc: 'Kết nối trực tiếp database SQL', soon: true },
              { icon: '📈', name: 'Google Sheets', desc: 'Đọc dữ liệu từ Google Spreadsheet', soon: true },
              { icon: '🛒', name: 'Shopify / WooCommerce', desc: 'Đồng bộ đơn hàng từ e-commerce', soon: true },
            ].map(c => (
              <div key={c.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 opacity-60 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">{c.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700">{c.name}</h3>
                  <p className="text-sm text-gray-400">{c.desc}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600">{t.comingSoon}</span>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════ KNOWLEDGE TAB ════════════════════ */}
        {activeTab === 'knowledge' && (
          <div className="p-4 sm:p-6 md:p-8">
            {isLoadingData ? (
              <div className="flex h-full items-center justify-center flex-col gap-4 h-96">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap justify-between items-start gap-3 mb-6 md:mb-8">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.knowledgeTitle}</h1>
                    <p className="text-gray-500 text-sm mt-1">{t.knowledgeDesc}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowEmbedModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-purple-600 text-white hover:bg-purple-700 shadow-sm text-sm">
                      <CodeIcon className="w-4 h-4"/> {t.embedCode}
                    </button>
                    <button onClick={() => setShowUpload(!showUpload)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm text-sm ${showUpload ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {showUpload ? <XIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>}
                      {showUpload ? t.cancel : t.addDoc}
                    </button>
                  </div>
                </div>

                {showUpload && (
                  <div className="mb-8 bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-50/50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><UploadIcon className="w-5 h-5 text-blue-500"/> {t.uploadDoc}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 flex flex-col items-center justify-center p-6 text-center hover:bg-blue-50 transition-colors relative min-h-[200px]">
                        <UploadIcon className="w-10 h-10 text-blue-300 mb-3"/>
                        <span className="font-semibold text-gray-700">{t.dragDrop}</span>
                        <span className="text-xs text-gray-400 mt-1">{t.fileTypes}</span>
                        <input type="file" accept=".txt,.md,.json,.pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        {isProcessing && <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>}
                      </div>
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t.titleLabel}</label>
                          <div className="flex gap-2">
                            <input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder={t.titlePlaceholder}/>
                            <button onClick={handleAnalyze} disabled={isAnalyzing || !uploadText} className="px-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 disabled:opacity-50">
                              {isAnalyzing ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"/> : <MagicIcon className="w-5 h-5"/>}
                            </button>
                          </div>
                        </div>
                        <textarea value={uploadText} onChange={e => setUploadText(e.target.value)} className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder={t.contentPlaceholder}/>
                        <button onClick={handleAddToKnowledge} disabled={isProcessing || !uploadText.trim()} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">{t.saveEmbed}</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mb-6">
                  <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-400 font-bold uppercase block">{t.files}</span>
                    <span className="text-xl font-bold">{knowledgeList.length}</span>
                  </div>
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t.search} className="w-full h-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"/>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {filteredKnowledge.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">{t.noDocuments}</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredKnowledge.map(item => (
                        <div key={item.id} className="p-5 hover:bg-gray-50 flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {item.fileName?.split('.').pop()?.slice(0,3) || 'TXT'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(item.dateAdded).toLocaleDateString()} • {Math.ceil(item.content.length / 1024)} KB</p>
                          </div>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <TrashIcon className="w-5 h-5"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════ FEEDBACK TAB ════════════════════ */}
        {activeTab === 'feedback' && (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-6 md:mb-8">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.feedbackTitle}</h1>
                <p className="text-gray-500 text-sm mt-1">{t.feedbackDesc}</p>
              </div>
              <button onClick={handleRunFeedbackAnalysis} disabled={isAnalyzingFeedback}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 text-sm">
                {isAnalyzingFeedback ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> {t.aiReading}</> : <><MagicIcon className="w-5 h-5"/> {t.analyzeAI}</>}
              </button>
            </div>

            {analysisResult && (
              <div className="mb-8 bg-white rounded-2xl p-8 shadow-xl border border-indigo-100 animate-fade-in">
                <h4 className="font-bold text-indigo-900 mb-6 flex items-center gap-2 text-lg"><MagicIcon className="w-6 h-6 text-indigo-500"/> {t.qualityReport}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="border-r border-gray-100 pr-4">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t.satisfactionScore}</p>
                    <span className={`text-6xl font-black ${analysisResult.sentimentScore > 75 ? 'text-green-500' : analysisResult.sentimentScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>{analysisResult.sentimentScore}</span>
                    <span className="text-gray-400"> / 100</span>
                    <p className="text-sm text-gray-400 mt-2">{feedbackLogs.length} {t.ratings}</p>
                  </div>
                  <div className="col-span-2 pl-4">
                    <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                      <p className="text-xs font-bold text-indigo-400 uppercase mb-1">{t.summary}</p>
                      <p className="text-gray-700 italic">"{analysisResult.summary}"</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.commonIssues.map((issue, i) => (
                        <span key={i} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">{issue}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="text-xs font-bold text-gray-400 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 w-16">{t.vote}</th>
                    <th className="px-6 py-3">{t.userAsked}</th>
                    <th className="px-6 py-3">{t.botReplied}</th>
                    <th className="px-6 py-3 w-32 text-right">{t.time}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {feedbackLogs.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-gray-400 italic">{t.noFeedback}</td></tr>
                  ) : feedbackLogs.slice(0, 50).map(log => (
                    <tr key={log.timestamp} className="hover:bg-blue-50/30 group">
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.feedback === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {log.feedback === 'up' ? <ThumbsUpIcon className="w-4 h-4"/> : <ThumbsDownIcon className="w-4 h-4"/>}
                        </div>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm font-semibold text-gray-900 max-w-xs truncate">{log.userQuery || 'N/A'}</p></td>
                      <td className="px-6 py-4"><p className="text-sm text-gray-500 max-w-sm truncate">{log.text}</p></td>
                      <td className="px-6 py-4 text-right"><span className="text-xs text-gray-400 font-mono">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ SETTINGS TAB ════════════════════ */}
        {activeTab === 'settings' && (
          <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t.settingsTitle}</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">{t.basicInfo}</h3>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">{t.botName}</label>
                  <input type="text" value={localConfig.botName} onChange={e => setLocalConfig({...localConfig, botName: e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">{t.greeting}</label>
                  <input type="text" value={localConfig.welcomeMessage} onChange={e => setLocalConfig({...localConfig, welcomeMessage: e.target.value})} className="w-full border rounded-lg px-3 py-2"/>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">{t.suggestedQuestions}</h3>
                <div className="flex gap-2">
                  <input type="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder={t.questionPlaceholder} className="flex-1 border rounded-lg px-3 py-2" onKeyPress={e => e.key === 'Enter' && handleAddQuestion()}/>
                  <button onClick={handleAddQuestion} className="bg-blue-600 text-white px-4 py-2 rounded-lg"><PlusIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localConfig.suggestedQuestions?.map((q, i) => (
                    <div key={i} className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                      {q} <button onClick={() => setLocalConfig(p => ({...p, suggestedQuestions: p.suggestedQuestions?.filter((_,j)=>j!==i)}))} className="text-blue-300 hover:text-red-500"><XIcon className="w-4 h-4"/></button>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleSaveConfig} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg">{t.saveSettings}</button>
            </div>
          </div>
        )}

        {/* ════════════════════ INSTALL TAB ════════════════════ */}
        {activeTab === 'install' && (
          <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{t.installTitle}</h1>
            <div className="bg-gray-900 text-gray-300 p-8 rounded-3xl font-mono text-sm shadow-2xl border border-gray-800">
              <div className="space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"/> {t.serverStatusLabel}</h4>
                <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                  <p>API: <span className="text-blue-400">http://localhost:3001/api</span></p>
                  <p>Status: <span className="text-green-400">{t.online}</span></p>
                </div>
                <p className="text-xs opacity-50">{t.multitenantNote}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>

    <EmbedCodeModal isOpen={showEmbedModal} onClose={() => setShowEmbedModal(false)}/>
    </>
  );
};

export default AdminPanel;