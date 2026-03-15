import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Database, Bot, Link, ChevronRight, ArrowLeft, Upload, Search, Plus, Trash2, Edit2, FileText, CheckCircle2, X, Settings2, AlertCircle, MessageSquare, Briefcase, Activity, DollarSign, Zap, LayoutDashboard, Building2, FileSpreadsheet, Server, BrainCircuit, LayoutTemplate, Loader2, Play, Settings, DatabaseZap, Network } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DashboardConfig } from '../components/admin/DashboardConfig';
import { INDUSTRIES } from '../data/kpiData';

export const Admin = () => {
  const { t } = useLanguage();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const adminModules = [
    { id: 'company', icon: Building2, title: t('admin.companyProfile'), desc: t('admin.companyProfileDesc'), color: 'bg-teal-50 text-teal-600' },
    { id: 'dashboardConfig', icon: LayoutDashboard, title: t('admin.dashboardConfig'), desc: t('admin.dashboardConfigDesc'), color: 'bg-orange-50 text-orange-600' },
    { id: 'users', icon: Users, title: t('admin.users'), desc: t('admin.usersDesc'), color: 'bg-blue-50 text-blue-600' },
    { id: 'data', icon: Database, title: t('admin.data'), desc: t('admin.dataDesc'), color: 'bg-indigo-50 text-indigo-600' },
    { id: 'bot', icon: Bot, title: t('admin.botSettings'), desc: t('admin.botSettingsDesc'), color: 'bg-purple-50 text-purple-600' },
    { id: 'integrations', icon: Link, title: t('admin.integrations'), desc: t('admin.integrationsDesc'), color: 'bg-pink-50 text-pink-600' },
  ];

  // --- Company Settings State ---
  const [companySettings, setCompanySettings] = useState(() => {
    const saved = localStorage.getItem('tenant_settings');
    return saved ? JSON.parse(saved) : { name: 'Acme Corp', industry: 'mfg' };
  });

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newSettings = {
      name: formData.get('name') as string,
      industry: formData.get('industry') as string,
    };
    setCompanySettings(newSettings);
    localStorage.setItem('tenant_settings', JSON.stringify(newSettings));
    alert(t('admin.companySaved'));
  };

  // --- Users State ---
  const [users, setUsers] = useState([
    { id: 1, name: 'Tanaka Taro', email: 'tanaka@nippon.co.jp', role: 'Admin', department: 'Management', status: 'Active', lastLogin: '2026-03-11 08:30', permissions: ['all'] },
    { id: 2, name: 'Suzuki Ichiro', email: 'suzuki@nippon.co.jp', role: 'Manager', department: 'Sales', status: 'Active', lastLogin: '2026-03-10 15:45', permissions: ['dashboard', 'reports', 'chat'] },
    { id: 3, name: 'Sato Hanako', email: 'sato@nippon.co.jp', role: 'Staff', department: 'HR', status: 'Inactive', lastLogin: '2026-02-28 09:15', permissions: ['dashboard', 'chat'] },
  ]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('Staff');

  const availablePermissions = [
    { id: 'dashboard', label: t('admin.permDashboard') },
    { id: 'reports', label: t('admin.permReports') },
    { id: 'chat', label: t('admin.permChat') },
    { id: 'settings', label: t('admin.permSettings') }
  ];

  const handlePermissionToggle = (permId: string) => {
    if (selectedRole === 'Admin') return;
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const openUserModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setSelectedRole(user.role);
      setSelectedPermissions(user.permissions || []);
    } else {
      setEditingUser(null);
      setSelectedRole('Staff');
      setSelectedPermissions(['dashboard', 'chat']); // Default permissions
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const role = formData.get('role') as string;
    
    const newUser = {
      id: editingUser ? editingUser.id : Date.now(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      department: formData.get('department') as string,
      role: role,
      status: formData.get('status') as string,
      lastLogin: editingUser ? editingUser.lastLogin : 'Never',
      permissions: role === 'Admin' ? ['all'] : selectedPermissions,
    };

    if (editingUser) {
      setUsers(users.map(u => u.id === newUser.id ? newUser : u));
    } else {
      setUsers([...users, newUser]);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // --- Data & RAG State ---
  const [dataTab, setDataTab] = useState<'sources' | 'training' | 'mapping'>('sources');
  const [dataSources, setDataSources] = useState([
    { id: 1, name: 'Báo cáo tài chính Q1.pdf', type: 'PDF', size: '2.4 MB', status: 'Learned', date: '2026-03-01', records: 0 },
    { id: 2, name: 'Danh sách nhân sự 2026.csv', type: 'CSV', size: '1.1 MB', status: 'Learned', date: '2026-03-05', records: 1250 },
    { id: 3, name: 'Doanh thu bán hàng_Tháng 3.xlsx', type: 'Excel', size: '5.2 MB', status: 'Processing', date: '2026-03-07', records: 8400 },
    { id: 4, name: 'PostgreSQL_Production', type: 'Database', size: 'N/A', status: 'Connected', date: '2026-03-10', records: 150000 },
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const [agentSchemas, setAgentSchemas] = useState([
    { id: 1, sourceId: 2, name: 'Nhân sự', fields: ['Mã NV', 'Họ tên', 'Phòng ban', 'Lương', 'Ngày vào làm'], confidence: 98 },
    { id: 2, sourceId: 3, name: 'Doanh thu', fields: ['Mã ĐH', 'Ngày', 'Sản phẩm', 'Số lượng', 'Doanh thu', 'Khu vực'], confidence: 95 },
  ]);

  const [dashboardMappings, setDashboardMappings] = useState([
    { id: 1, schemaId: 2, template: 'Sales Overview', status: 'Active', lastSync: '10 mins ago' },
    { id: 2, schemaId: 1, template: 'HR Analytics', status: 'Draft', lastSync: 'N/A' },
  ]);

  const [isConnectDBModalOpen, setIsConnectDBModalOpen] = useState(false);
  const [isAddSchemaModalOpen, setIsAddSchemaModalOpen] = useState(false);
  const [isAddMappingModalOpen, setIsAddMappingModalOpen] = useState(false);

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setDataSources([{ id: Date.now(), name: 'new_training_data.csv', type: 'CSV', size: '1.5 MB', status: 'Processing', date: new Date().toISOString().split('T')[0], records: 500 }, ...dataSources]);
      setIsUploading(false);
    }, 1500);
  };

  const handleDeleteDataSource = (id: number) => {
    if (confirm('Xóa nguồn dữ liệu này? Agent sẽ không còn sử dụng dữ liệu này nữa.')) {
      setDataSources(dataSources.filter(f => f.id !== id));
    }
  };

  // --- Integrations State ---
  const [integrations, setIntegrations] = useState([
    { id: 'line', name: 'LINE WORKS', desc: 'Receive notifications and approve requests via LINE.', connected: true, icon: MessageSquare },
    { id: 'kintone', name: 'Kintone', desc: 'Sync customer and sales data automatically.', connected: false, icon: Database },
    { id: 'salesforce', name: 'Salesforce', desc: 'Two-way CRM data synchronization.', connected: false, icon: Link },
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-24 md:pb-10"
    >
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('menu.admin')}</h1>
        <p className="text-slate-500 mt-2">{t('admin.desc')}</p>
      </header>

      <AnimatePresence mode="wait">
        {!activeModule ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {adminModules.map((module) => (
              <div 
                key={module.id} 
                onClick={() => setActiveModule(module.id)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${module.color}`}>
                  <module.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{module.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{module.desc}</p>
                <div className="mt-4 flex items-center text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('admin.manage')} <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col"
          >
            <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
              <button 
                onClick={() => setActiveModule(null)}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
                title={t('admin.backToAdmin')}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-bold text-slate-800">
                {adminModules.find(m => m.id === activeModule)?.title}
              </h2>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              
              {/* --- COMPANY PROFILE MODULE --- */}
              {activeModule === 'company' && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{t('admin.companyProfile')}</h3>
                    <p className="text-sm text-slate-500">{t('admin.companyProfileDesc')}</p>
                  </div>
                  <form onSubmit={handleSaveCompanySettings} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('admin.companyName')}</label>
                      <input name="name" defaultValue={companySettings.name} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('admin.industry')}</label>
                      <select name="industry" defaultValue={companySettings.industry} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                        {INDUSTRIES.map(ind => (
                          <option key={ind.id} value={ind.id}>
                            {t(`industry.${ind.id}`) !== `industry.${ind.id}` ? t(`industry.${ind.id}`) : ind.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={14} /> {t('admin.industryWarning')}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                        {t('admin.saveChanges')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* --- DASHBOARD CONFIG MODULE --- */}
              {activeModule === 'dashboardConfig' && (
                <DashboardConfig />
              )}

              {/* --- USERS MODULE --- */}
              {activeModule === 'users' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" placeholder={t('admin.searchUsers')} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <button 
                      onClick={() => openUserModal()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={16} /> {t('admin.addUser')}
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                          <th className="p-4 font-bold">{t('admin.user')}</th>
                          <th className="p-4 font-bold">{t('admin.roleDept')}</th>
                          <th className="p-4 font-bold">{t('admin.status')}</th>
                          <th className="p-4 font-bold">{t('admin.lastLogin')}</th>
                          <th className="p-4 font-bold text-right">{t('admin.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                                  {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">{user.name}</div>
                                  <div className="text-xs text-slate-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                  user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                  user.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {user.role}
                                </span>
                                <span className="text-xs text-slate-500">{user.department}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit ${
                                user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {user.status === 'Active' && <CheckCircle2 size={12} />}
                                {user.status}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 text-xs">
                              {user.lastLogin}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => openUserModal(user)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit User">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- DATA & RAG MODULE --- */}
              {activeModule === 'data' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 border-b border-slate-200 pb-4">
                    <button
                      onClick={() => setDataTab('sources')}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${dataTab === 'sources' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {t('admin.dataSources')}
                    </button>
                    <button
                      onClick={() => setDataTab('training')}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${dataTab === 'training' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {t('admin.agentTraining')}
                    </button>
                    <button
                      onClick={() => setDataTab('mapping')}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${dataTab === 'mapping' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {t('admin.dashboardConfigTab')}
                    </button>
                  </div>

                  {dataTab === 'sources' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">{t('admin.uploadDesc')}</p>
                        <button 
                          onClick={() => setIsConnectDBModalOpen(true)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
                        >
                          <Network size={16} />
                          {t('admin.connectDB')}
                        </button>
                      </div>

                      <div 
                        onClick={handleFileUpload}
                        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                          isUploading ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isUploading ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                          {isUploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {isUploading ? t('admin.uploading') : t('admin.uploadData')}
                        </h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm">
                          {t('admin.dragDrop')}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Database size={18} className="text-indigo-600" />
                          {t('admin.dataSourceList')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dataSources.map(source => (
                            <div key={source.id} className="flex items-start justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                              <div className="flex gap-3">
                                <div className={`p-2 rounded-lg shrink-0 h-fit ${
                                  source.type === 'Database' ? 'bg-blue-50 text-blue-600' :
                                  source.type === 'Excel' || source.type === 'CSV' ? 'bg-emerald-50 text-emerald-600' :
                                  'bg-indigo-50 text-indigo-600'
                                }`}>
                                  {source.type === 'Database' ? <DatabaseZap size={20} /> :
                                   source.type === 'Excel' || source.type === 'CSV' ? <FileSpreadsheet size={20} /> :
                                   <FileText size={20} />}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{source.name}</p>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                                    <span>{source.type}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{source.size}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{source.records} {t('admin.records')}</span>
                                  </div>
                                  <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    source.status === 'Learned' ? 'bg-emerald-100 text-emerald-700' : 
                                    source.status === 'Connected' ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700 animate-pulse'
                                  }`}>
                                    {source.status === 'Learned' && <CheckCircle2 size={10} />}
                                    {source.status === 'Processing' && <Loader2 size={10} className="animate-spin" />}
                                    {source.status}
                                  </span>
                                </div>
                              </div>
                              <button onClick={() => handleDeleteDataSource(source.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {dataTab === 'training' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">{t('admin.trainingDesc')}</p>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shrink-0">
                          <BrainCircuit size={16} />
                          {t('admin.retrainAll')}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {agentSchemas.map(schema => {
                          const source = dataSources.find(s => s.id === schema.sourceId);
                          return (
                            <div key={schema.id} className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                                    <BrainCircuit size={20} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-800">{schema.name}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{t('admin.source')}: {source?.name || t('admin.unknown')}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">
                                    <CheckCircle2 size={14} />
                                    {t('admin.accuracy')}: {schema.confidence}%
                                  </div>
                                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title={t('admin.editSchema')}>
                                    <Edit2 size={16} />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('admin.detectedFields')}</p>
                                <div className="flex flex-wrap gap-2">
                                  {schema.fields.map((field, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-md shadow-sm">
                                      {field}
                                    </span>
                                  ))}
                                  <button 
                                    onClick={() => setIsAddSchemaModalOpen(true)}
                                    className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs rounded-md border-dashed hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                  >
                                    <Plus size={12} /> {t('admin.addField')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {dataTab === 'mapping' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">{t('admin.mappingDesc')}</p>
                        <button 
                          onClick={() => setIsAddMappingModalOpen(true)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
                        >
                          <Plus size={16} />
                          {t('admin.createNewMapping')}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {dashboardMappings.map(mapping => {
                          const schema = agentSchemas.find(s => s.id === mapping.schemaId);
                          return (
                            <div key={mapping.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-4 sm:gap-6">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-200">
                                    <BrainCircuit size={24} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 text-center max-w-[80px] truncate" title={schema?.name}>{schema?.name || t('admin.unknown')}</span>
                                </div>
                                
                                <div className="flex flex-col items-center text-slate-300">
                                  <ChevronRight size={24} />
                                  <div className="h-px w-8 sm:w-12 bg-slate-200 my-1"></div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">{t('admin.autoMap')}</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                    <LayoutTemplate size={24} />
                                  </div>
                                  <span className="text-xs font-bold text-indigo-600 text-center max-w-[80px] truncate" title={mapping.template}>{mapping.template}</span>
                                </div>
                              </div>

                              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  mapping.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {mapping.status === 'Active' ? <Play size={12} className="fill-current" /> : <Settings size={12} />}
                                  {mapping.status}
                                </span>
                                <span className="text-xs text-slate-400">{t('admin.sync')}: {mapping.lastSync}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- INTEGRATIONS MODULE --- */}
              {activeModule === 'integrations' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 mb-6">{t('admin.integrationsDesc')}</p>
                  
                  <div className="grid gap-4">
                    {integrations.map(app => (
                      <div key={app.id} className="flex items-center justify-between p-5 border border-slate-200 rounded-xl bg-white">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${app.connected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            <app.icon size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">{app.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">{app.desc}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleIntegration(app.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                            app.connected 
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {app.connected ? t('admin.disconnect') : t('admin.connect')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- AI AGENTS MODULE --- */}
              {activeModule === 'bot' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{t('admin.aiAgentStudio')}</h3>
                      <p className="text-sm text-slate-500">{t('admin.aiAgentDesc')}</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      <Plus size={16} /> {t('admin.createAgent')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Agent List */}
                    <div className="lg:col-span-2 space-y-4">
                      {[
                        { name: 'Sales Copilot', role: 'Sales & CRM', status: 'Active', tone: 'Business Casual', tasks: 1240, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { name: 'HR Assistant', role: 'Internal HR', status: 'Active', tone: 'Polite (Teineigo)', tasks: 856, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { name: 'Finance Analyst', role: 'Data & Reports', status: 'Training', tone: 'Strict/Professional', tasks: 0, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
                      ].map((agent, idx) => (
                        <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-indigo-300 transition-all group cursor-pointer flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${agent.bg} ${agent.color}`}>
                              <agent.icon size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{agent.name}</h4>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${agent.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {agent.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">{agent.role} • {agent.tone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                            <div className="text-sm font-bold text-slate-700">{agent.tasks.toLocaleString()} <span className="text-xs font-normal text-slate-500">{t('admin.tasksAutomated')}</span></div>
                            <div className="flex gap-2 mt-2 sm:mt-0">
                              <button className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg"><Settings2 size={16} /></button>
                              <button className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg"><Activity size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Differentiator Features Panel */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Bot size={100} />
                        </div>
                        <h4 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                          <Zap size={18} className="text-amber-400" /> {t('admin.proactiveTriggers')}
                        </h4>
                        <p className="text-sm text-indigo-100 mb-4 relative z-10 leading-relaxed">
                          {t('admin.proactiveDesc')}
                        </p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors relative z-10">
                          {t('admin.configureTriggers')}
                        </button>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <MessageSquare size={18} className="text-indigo-600" /> {t('admin.jpContextTuning')}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.keigoLevel')}</label>
                            <select className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                              <option>Teineigo (Polite)</option>
                              <option>Sonkeigo/Kenjougo (Highly Formal)</option>
                              <option>Casual (Internal only)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">{t('admin.industryJargon')}</label>
                            <select className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                              <option>Manufacturing & Trading</option>
                              <option>IT & Software</option>
                              <option>Finance & Banking</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingUser ? t('admin.editUser') : t('admin.addNewUser')}
                </h3>
                <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.fullName')}</label>
                    <input name="name" defaultValue={editingUser?.name} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.emailAddress')}</label>
                    <input name="email" defaultValue={editingUser?.email} required type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.department')}</label>
                    <input name="department" defaultValue={editingUser?.department} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.role')}</label>
                    <select 
                      name="role" 
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.status')}</label>
                    <select name="status" defaultValue={editingUser?.status || 'Active'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      {editingUser ? t('admin.resetPassword') : t('admin.initialPassword')}
                    </label>
                    <input name="password" type="password" required={!editingUser} placeholder={editingUser ? t('admin.leaveBlank') : t('admin.enterPassword')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('admin.modulePermissions')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availablePermissions.map(perm => {
                      const isChecked = selectedRole === 'Admin' || selectedPermissions.includes('all') || selectedPermissions.includes(perm.id);
                      return (
                        <label key={perm.id} className={`flex items-center gap-2 cursor-pointer group ${selectedRole === 'Admin' ? 'opacity-70' : ''}`}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-300 group-hover:border-indigo-400'
                          }`}>
                            {isChecked && <CheckCircle2 size={14} />}
                          </div>
                          <span className="text-sm text-slate-700">{perm.label}</span>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isChecked}
                            onChange={() => handlePermissionToggle(perm.id)}
                            disabled={selectedRole === 'Admin'}
                          />
                        </label>
                      );
                    })}
                  </div>
                  {selectedRole === 'Admin' && (
                    <p className="text-xs text-indigo-600 mt-2 font-medium">{t('admin.adminAccessNote')}</p>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">{t('admin.cancel')}</button>
                  <button type="submit" className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors">{t('admin.saveUser')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DATA & RAG MODALS --- */}
      <AnimatePresence>
        {isConnectDBModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <DatabaseZap size={18} className="text-indigo-600" />
                  {t('admin.connectDBAPI')}
                </h3>
                <button onClick={() => setIsConnectDBModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.connectionType')}</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">MongoDB</option>
                    <option value="rest">REST API</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.displayName')}</label>
                  <input type="text" placeholder={t('admin.placeholderDB')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.connectionString')}</label>
                  <input type="text" placeholder="postgresql://user:pass@localhost:5432/db" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setIsConnectDBModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">{t('admin.cancel')}</button>
                  <button type="button" onClick={() => {
                    setDataSources([{ id: Date.now(), name: 'New_Database_Connection', type: 'Database', size: 'N/A', status: 'Connected', date: new Date().toISOString().split('T')[0], records: 0 }, ...dataSources]);
                    setIsConnectDBModalOpen(false);
                  }} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors">{t('admin.connectBtn')}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAddSchemaModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BrainCircuit size={18} className="text-indigo-600" />
                  {t('admin.addSchemaField')}
                </h3>
                <button onClick={() => setIsAddSchemaModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.fieldName')}</label>
                  <input type="text" placeholder={t('admin.placeholderNote')} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.fieldType')}</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="string">{t('admin.typeText')}</option>
                    <option value="number">{t('admin.typeNumber')}</option>
                    <option value="date">{t('admin.typeDate')}</option>
                    <option value="boolean">{t('admin.typeBoolean')}</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setIsAddSchemaModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">{t('admin.cancel')}</button>
                  <button type="button" onClick={() => setIsAddSchemaModalOpen(false)} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors">{t('admin.addBtn')}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAddMappingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <LayoutTemplate size={18} className="text-indigo-600" />
                  {t('admin.createMapping')}
                </h3>
                <button onClick={() => setIsAddMappingModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.selectSchema')}</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    {agentSchemas.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.selectTemplate')}</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="sales">Sales Overview</option>
                    <option value="hr">HR Analytics</option>
                    <option value="finance">Financial Report</option>
                    <option value="custom">Custom Template</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setIsAddMappingModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">{t('admin.cancel')}</button>
                  <button type="button" onClick={() => {
                    setDashboardMappings([{ id: Date.now(), schemaId: 1, template: 'New Template', status: 'Draft', lastSync: 'N/A' }, ...dashboardMappings]);
                    setIsAddMappingModalOpen(false);
                  }} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors">{t('admin.createBtn')}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
