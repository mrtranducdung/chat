import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Database, List, FileSignature, Bot, Link, History, ChevronRight, ArrowLeft, Upload, Search, Plus, Trash2, Edit2, FileText, CheckCircle2, X, Package, Truck, Settings2, AlertCircle, MessageSquare, Briefcase, Activity, DollarSign, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Admin = () => {
  const { t } = useLanguage();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const adminModules = [
    { id: 'users', icon: Users, title: t('admin.users'), desc: 'Manage roles and permissions', color: 'bg-blue-50 text-blue-600' },
    { id: 'data', icon: Database, title: t('admin.data'), desc: 'Upload documents for AI training', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'master', icon: List, title: t('admin.master'), desc: 'Products, suppliers, and partners', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'approval', icon: FileSignature, title: t('admin.approval'), desc: 'Digital Ringi-sho workflows', color: 'bg-amber-50 text-amber-600' },
    { id: 'bot', icon: Bot, title: t('admin.botSettings'), desc: 'Configure AI behavior and tone', color: 'bg-purple-50 text-purple-600' },
    { id: 'integrations', icon: Link, title: t('admin.integrations'), desc: 'Line, Kintone, Salesforce', color: 'bg-pink-50 text-pink-600' },
    { id: 'audit', icon: History, title: t('admin.audit'), desc: 'System changes and security logs', color: 'bg-slate-100 text-slate-600' },
  ];

  const [users, setUsers] = useState([
    { id: 1, name: 'Tanaka Taro', email: 'tanaka@nippon.co.jp', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Suzuki Ichiro', email: 'suzuki@nippon.co.jp', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Sato Hanako', email: 'sato@nippon.co.jp', role: 'Staff', status: 'Inactive' },
  ]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newUser = {
      id: editingUser ? editingUser.id : Date.now(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      status: formData.get('status') as string,
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

  const [files, setFiles] = useState([
    { id: 1, name: 'company_policy_2026.pdf', size: '2.4 MB', status: 'Processed', date: '2026-03-01' },
    { id: 2, name: 'product_catalog_v2.csv', size: '1.1 MB', status: 'Processed', date: '2026-03-05' },
    { id: 3, name: 'Q1_financial_report.docx', size: '500 KB', status: 'Processing...', date: '2026-03-07' },
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setFiles([{ id: Date.now(), name: 'new_training_data.pdf', size: '1.5 MB', status: 'Processing...', date: new Date().toISOString().split('T')[0] }, ...files]);
      setIsUploading(false);
    }, 1500);
  };

  const handleDeleteFile = (id: number) => {
    if (confirm('Delete this file? The AI will no longer use it for context.')) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  const [activeMasterTab, setActiveMasterTab] = useState<'products' | 'suppliers'>('products');
  const [products] = useState([
    { id: 1, code: 'PRD-001', name: 'Industrial Robot Arm X1', category: 'Robotics', price: '¥1,200,000', stock: 45 },
    { id: 2, code: 'PRD-002', name: 'Smart Sensor Node', category: 'IoT', price: '¥15,000', stock: 320 },
    { id: 3, code: 'PRD-003', name: 'Control Panel Pro', category: 'Hardware', price: '¥85,000', stock: 12 },
  ]);
  const [suppliers] = useState([
    { id: 1, name: 'Tokyo Tech Components', contact: 'contact@tokyotech.co.jp', rating: 'A', status: 'Active' },
    { id: 2, name: 'Osaka Steel Works', contact: 'sales@osakasteel.jp', rating: 'B+', status: 'Active' },
  ]);

  const [workflows] = useState([
    { id: 1, name: 'Purchase Request (Ringi)', steps: ['Manager', 'Finance Director', 'CEO'], status: 'Active' },
    { id: 2, name: 'New Hire Approval', steps: ['HR Manager', 'Department Head'], status: 'Active' },
    { id: 3, name: 'Contract Renewal', steps: ['Legal', 'CEO'], status: 'Draft' },
  ]);

  const [integrations, setIntegrations] = useState([
    { id: 'line', name: 'LINE WORKS', desc: 'Receive notifications and approve requests via LINE.', connected: true, icon: MessageSquare },
    { id: 'kintone', name: 'Kintone', desc: 'Sync customer and sales data automatically.', connected: false, icon: Database },
    { id: 'salesforce', name: 'Salesforce', desc: 'Two-way CRM data synchronization.', connected: false, icon: Link },
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
  };

  const auditLogs = [
    { id: 1, action: 'User Login', user: 'admin@nippon.co.jp', ip: '192.168.1.105', date: '2026-03-07 08:30:22', status: 'Success' },
    { id: 2, action: 'Modified Ringi Workflow', user: 'admin@nippon.co.jp', ip: '192.168.1.105', date: '2026-03-06 15:45:10', status: 'Success' },
    { id: 3, action: 'Deleted Training Data', user: 'suzuki@nippon.co.jp', ip: '10.0.0.42', date: '2026-03-05 11:20:05', status: 'Warning' },
    { id: 4, action: 'Failed Login Attempt', user: 'unknown', ip: '203.0.113.45', date: '2026-03-04 02:15:00', status: 'Danger' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-24 md:pb-10"
    >
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('menu.admin')}</h1>
        <p className="text-slate-500 mt-2">System configuration and management.</p>
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
                  Manage <ChevronRight size={16} className="ml-1" />
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
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-bold text-slate-800">
                {adminModules.find(m => m.id === activeModule)?.title}
              </h2>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">

              {/* USERS MODULE */}
              {activeModule === 'users' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" placeholder="Search users by name or email..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <button
                      onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={16} /> Add User
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                          <th className="p-4 font-bold">Name</th>
                          <th className="p-4 font-bold">Email</th>
                          <th className="p-4 font-bold">Role</th>
                          <th className="p-4 font-bold">Status</th>
                          <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-800">{user.name}</td>
                            <td className="p-4 text-slate-600">{user.email}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit ${
                                user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {user.status === 'Active' && <CheckCircle2 size={12} />}
                                {user.status}
                              </span>
                            </td>
                            <td className="p-4 text-right flex justify-end gap-2">
                              <button onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DATA & RAG MODULE */}
              {activeModule === 'data' && (
                <div className="space-y-8">
                  <div
                    onClick={handleFileUpload}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isUploading ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isUploading ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                      <Upload size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {isUploading ? 'Uploading & Processing...' : 'Upload Training Data'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm">
                      Drag and drop PDF, DOCX, or CSV files here, or click to browse. These files will be used to train the AI Chatbot via RAG.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Database size={18} className="text-indigo-600" />
                      Knowledge Base Files
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {files.map(file => (
                        <div key={file.id} className="flex items-start justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 h-fit">
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 line-clamp-1">{file.name}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>{file.date}</span>
                              </div>
                              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                file.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                              }`}>
                                {file.status}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteFile(file.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MASTER DATA MODULE */}
              {activeModule === 'master' && (
                <div className="space-y-6">
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => setActiveMasterTab('products')}
                      className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeMasterTab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      <div className="flex items-center gap-2"><Package size={16} /> Products</div>
                    </button>
                    <button
                      onClick={() => setActiveMasterTab('suppliers')}
                      className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeMasterTab === 'suppliers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      <div className="flex items-center gap-2"><Truck size={16} /> Suppliers</div>
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" placeholder={`Search ${activeMasterTab}...`} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      <Plus size={16} /> Add New
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                          {activeMasterTab === 'products' ? (
                            <>
                              <th className="p-4 font-bold">Code</th>
                              <th className="p-4 font-bold">Name</th>
                              <th className="p-4 font-bold">Category</th>
                              <th className="p-4 font-bold">Price</th>
                              <th className="p-4 font-bold">Stock</th>
                            </>
                          ) : (
                            <>
                              <th className="p-4 font-bold">Supplier Name</th>
                              <th className="p-4 font-bold">Contact</th>
                              <th className="p-4 font-bold">Rating</th>
                              <th className="p-4 font-bold">Status</th>
                            </>
                          )}
                          <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {activeMasterTab === 'products' ? products.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-4 font-mono text-xs text-slate-500">{item.code}</td>
                            <td className="p-4 font-bold text-slate-800">{item.name}</td>
                            <td className="p-4 text-slate-600">{item.category}</td>
                            <td className="p-4 text-slate-600">{item.price}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock < 20 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {item.stock} units
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"><Edit2 size={16} /></button>
                            </td>
                          </tr>
                        )) : suppliers.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-4 font-bold text-slate-800">{item.name}</td>
                            <td className="p-4 text-slate-600">{item.contact}</td>
                            <td className="p-4 font-bold text-indigo-600">{item.rating}</td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700">{item.status}</span>
                            </td>
                            <td className="p-4 text-right">
                              <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"><Edit2 size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* APPROVAL FLOWS MODULE */}
              {activeModule === 'approval' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Ringi-sho Workflows</h3>
                      <p className="text-sm text-slate-500">Configure electronic approval routing.</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      <Plus size={16} /> New Workflow
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {workflows.map(flow => (
                      <div key={flow.id} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">{flow.name}</h4>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${flow.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {flow.status}
                            </span>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg"><Settings2 size={18} /></button>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500 font-medium">Routing:</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {flow.steps.map((step, idx) => (
                              <React.Fragment key={idx}>
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">{step}</span>
                                {idx < flow.steps.length - 1 && <ChevronRight size={14} className="text-slate-400" />}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INTEGRATIONS MODULE */}
              {activeModule === 'integrations' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 mb-6">Connect third-party applications to sync data and enable cross-platform features.</p>
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
                          {app.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AUDIT LOGS MODULE */}
              {activeModule === 'audit' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                      Export CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                          <th className="p-4 font-bold">Timestamp</th>
                          <th className="p-4 font-bold">Action</th>
                          <th className="p-4 font-bold">User</th>
                          <th className="p-4 font-bold">IP Address</th>
                          <th className="p-4 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100 font-mono">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-4 text-slate-500 text-xs">{log.date}</td>
                            <td className="p-4 font-bold text-slate-800 font-sans">{log.action}</td>
                            <td className="p-4 text-slate-600">{log.user}</td>
                            <td className="p-4 text-slate-500 text-xs">{log.ip}</td>
                            <td className="p-4 font-sans">
                              <span className={`flex items-center gap-1 text-xs font-bold ${
                                log.status === 'Success' ? 'text-emerald-600' :
                                log.status === 'Warning' ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {log.status === 'Danger' && <AlertCircle size={12} />}
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AI AGENTS MODULE */}
              {activeModule === 'bot' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">AI Agent Studio</h3>
                      <p className="text-sm text-slate-500">Manage specialized AI agents, their knowledge, and behaviors.</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                      <Plus size={16} /> Create Agent
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <div className="text-sm font-bold text-slate-700">{agent.tasks.toLocaleString()} <span className="text-xs font-normal text-slate-500">tasks automated</span></div>
                            <div className="flex gap-2 mt-2 sm:mt-0">
                              <button className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg"><Settings2 size={16} /></button>
                              <button className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg"><Activity size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Bot size={100} />
                        </div>
                        <h4 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                          <Zap size={18} className="text-amber-400" /> Proactive Triggers
                        </h4>
                        <p className="text-sm text-indigo-100 mb-4 relative z-10 leading-relaxed">
                          Unlike passive chatbots, our agents monitor your data and initiate actions automatically.
                        </p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors relative z-10">
                          Configure Triggers
                        </button>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <MessageSquare size={18} className="text-indigo-600" /> Japanese Context Tuning
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Keigo Level (Default)</label>
                            <select className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
                              <option>Teineigo (Polite)</option>
                              <option>Sonkeigo/Kenjougo (Highly Formal)</option>
                              <option>Casual (Internal only)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Industry Jargon</label>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input name="name" defaultValue={editingUser?.name} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                  <input name="email" defaultValue={editingUser?.email} required type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                  <select name="role" defaultValue={editingUser?.role || 'Staff'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select name="status" defaultValue={editingUser?.status || 'Active'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors">Save User</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
