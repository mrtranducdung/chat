import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Globe, Save, CheckCircle2, Bot, Zap, CreditCard, Key, Building2, ShieldCheck, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    if (confirm('Are you sure you want to delete this goal?')) {
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
        <p className="text-slate-500 mt-2">Configure Agent behavior and system preferences.</p>
      </header>

      <div className="space-y-6">

        {/* 1. Agent Persona & Behavior */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Bot size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">AI Agent Persona & Behavior</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Communication Tone</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                <option>Professional & Formal (Default)</option>
                <option>Friendly & Approachable</option>
                <option>Direct & Concise (Executive Summary style)</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">Determines how the AI responds to user queries.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Escalation Path</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                <option>Route to Human Admin when confidence &lt; 80%</option>
                <option>Always attempt to answer, provide disclaimer</option>
                <option>Strictly refuse queries outside Knowledge Base</option>
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
              <h2 className="text-lg font-bold text-slate-800">Department Goals (OKRs)</h2>
            </div>
            <button
              onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              <Plus size={16} /> Add Goal
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
                    <p className="text-xs text-slate-500 font-medium">Current</p>
                    <p className="text-sm font-bold text-slate-900">{goal.current}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">Target</p>
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
          <p className="text-xs text-slate-500 mt-4">The AI Agent will monitor these metrics and alert you if they fall behind schedule.</p>
        </div>

        {/* 3. System & Language */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Globe size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">System Preferences</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Interface Language</label>
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

        {/* 4. Advanced Features */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-white">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Zap size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Advanced Features (Pro)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <CreditCard size={20} className="text-indigo-400 mb-3" />
              <h3 className="text-sm font-bold mb-1">Billing & Subscription</h3>
              <p className="text-xs text-slate-400">Manage your Enterprise plan, usage limits, and payment methods.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <Key size={20} className="text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold mb-1">API Keys & Webhooks</h3>
              <p className="text-xs text-slate-400">Generate API keys to integrate the Agent with external custom software.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <Building2 size={20} className="text-pink-400 mb-3" />
              <h3 className="text-sm font-bold mb-1">White-labeling</h3>
              <p className="text-xs text-slate-400">Customize logos, colors, and domain for your clients.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <ShieldCheck size={20} className="text-blue-400 mb-3" />
              <h3 className="text-sm font-bold mb-1">Advanced Security</h3>
              <p className="text-xs text-slate-400">SSO (SAML/OAuth), IP Whitelisting, and detailed Audit Logs.</p>
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
            {isSaving ? 'Saving Configuration...' : 'Save All Changes'}
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
            <span className="text-sm font-bold">Settings saved successfully!</span>
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
                  {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                </h3>
                <button onClick={() => setIsGoalModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleSaveGoal} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                  <input name="dept" defaultValue={editingGoal?.dept} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Sales, HR" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Metric Description</label>
                  <input name="metric" defaultValue={editingGoal?.metric} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Q3 Revenue" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Target</label>
                    <input name="target" defaultValue={editingGoal?.target} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., ¥50M" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Current</label>
                    <input name="current" defaultValue={editingGoal?.current} required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., ¥42M" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select name="status" defaultValue={editingGoal?.status || 'On Track'} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsGoalModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors">Save Goal</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
