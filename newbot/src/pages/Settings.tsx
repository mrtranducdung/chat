import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, BellRing, ShieldCheck, Globe, Save, CheckCircle2, Bot, Zap, CreditCard, Key, Building2, Users, Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAgent } from '../context/AgentContext';

export const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { agentSettings, updateAgentSettings } = useAgent();
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateAgentSettings({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Department Goals State ---
  const [goals, setGoals] = useState([
    { id: 1, dept: 'Sales', metric: 'Q3 Revenue', target: '¥50M', current: '¥42M', status: 'On Track' },
    { id: 2, dept: 'HR', metric: 'Employee Retention', target: '95%', current: '92%', status: 'At Risk' },
  ]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newGoal = {
      id: editingGoal ? editingGoal.id : Date.now(),
      dept: formData.get('dept') as string,
      metric: formData.get('metric') as string,
      target: formData.get('target') as string,
      current: formData.get('current') as string,
      status: formData.get('status') as string,
    };

    if (editingGoal) {
      setGoals(goals.map(g => g.id === newGoal.id ? newGoal : g));
    } else {
      setGoals([...goals, newGoal]);
    }
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: number) => {
    if (confirm(t('settings.confirmDeleteGoal'))) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 pb-24 md:pb-10"
    >
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('menu.settings')}</h1>
        <p className="text-slate-500 mt-2">{t('settings.desc')}</p>
      </header>

      <div className="space-y-6">
        
        {/* 0. Agent Identity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ImageIcon size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('settings.agentIdentity')}</h2>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative group shrink-0">
                <div className="min-w-[80px] min-h-[80px] max-w-[200px] max-h-[200px] rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative transition-all duration-200">
                  {agentSettings.logo ? (
                    <img src={agentSettings.logo} alt="Agent Logo" className="w-auto h-auto max-w-full max-h-full object-contain" />
                  ) : (
                    <Bot size={32} className="text-slate-400 m-6" />
                  )}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                  >
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('settings.agentName')}</label>
                <input 
                  type="text" 
                  value={agentSettings.name}
                  onChange={(e) => updateAgentSettings({ name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  placeholder="e.g., AI Assistant"
                />
                <p className="text-xs text-slate-500 mt-2">{t('settings.agentNameDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Agent Persona & Behavior */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Bot size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('settings.personaBehavior')}</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('settings.commTone')}</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                <option>{t('settings.toneProfessional')}</option>
                <option>{t('settings.toneFriendly')}</option>
                <option>{t('settings.toneDirect')}</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">{t('settings.commToneDesc')}</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('settings.escalationPath')}</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                <option>{t('settings.escRouteAdmin')}</option>
                <option>{t('settings.escAlwaysAnswer')}</option>
                <option>{t('settings.escStrictRefuse')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Department Goals (OKR Tracking) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Target size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">{t('settings.deptGoals')}</h2>
            </div>
            <button 
              onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              <Plus size={16} /> {t('settings.addGoal')}
            </button>
          </div>
          
          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{goal.dept}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      goal.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{goal.metric}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">{t('settings.current')}</p>
                    <p className="text-sm font-bold text-slate-900">{goal.current}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">{t('settings.target')}</p>
                    <p className="text-sm font-bold text-indigo-600">{goal.target}</p>
                  </div>
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                    <button onClick={() => { setEditingGoal(goal); setIsGoalModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">{t('settings.goalDesc')}</p>
        </div>

        {/* 3. System & Language */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Globe size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('settings.systemPrefs')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('settings.interfaceLang')}</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'vi' | 'ja' | 'en')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                <option value="ja">日本語 (Japanese)</option>
                <option value="vi">Tiếng Việt (Vietnamese)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Commercialization & Advanced (Suggestions) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-white">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Zap size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">{t('settings.advancedPro')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <CreditCard size={20} className="text-indigo-400 mb-3" />
              <h3 className="text-sm font-bold mb-1">{t('settings.billing')}</h3>
              <p className="text-xs text-slate-400">{t('settings.billingDesc')}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <Key size={20} className="text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold mb-1">{t('settings.apiKeys')}</h3>
              <p className="text-xs text-slate-400">{t('settings.apiKeysDesc')}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <Building2 size={20} className="text-pink-400 mb-3" />
              <h3 className="text-sm font-bold mb-1">{t('settings.whitelabel')}</h3>
              <p className="text-xs text-slate-400">{t('settings.whitelabelDesc')}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <ShieldCheck size={20} className="text-blue-400 mb-3" />
              <h3 className="text-sm font-bold mb-1">{t('settings.advancedSecurity')}</h3>
              <p className="text-xs text-slate-400">{t('settings.advancedSecurityDesc')}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-70"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {isSaving ? t('settings.saving') : t('settings.saveAll')}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50"
          >
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-sm font-bold">{t('settings.saveSuccess')}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Goal Modal */}
      <AnimatePresence>
        {isGoalModalOpen && (
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
                  {editingGoal ? t('settings.editGoal') : t('settings.addNewGoal')}
                </h3>
                <button onClick={() => setIsGoalModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleSaveGoal} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('settings.department')}</label>
                  <input name="dept" defaultValue={editingGoal?.dept} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t('settings.placeholderDept')} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('settings.metricDesc')}</label>
                  <input name="metric" defaultValue={editingGoal?.metric} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t('settings.placeholderMetric')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('settings.target')}</label>
                    <input name="target" defaultValue={editingGoal?.target} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t('settings.placeholderTarget')} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('settings.current')}</label>
                    <input name="current" defaultValue={editingGoal?.current} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t('settings.placeholderCurrent')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('settings.status')}</label>
                  <select name="status" defaultValue={editingGoal?.status || 'On Track'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="On Track">{t('settings.onTrack')}</option>
                    <option value="At Risk">{t('settings.atRisk')}</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsGoalModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">{t('settings.cancel')}</button>
                  <button type="submit" className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors">{t('settings.saveGoal')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
