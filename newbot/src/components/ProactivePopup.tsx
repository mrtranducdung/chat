import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, TrendingDown, Bot, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type TriggerEvent = {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const ProactivePopup = () => {
  const [activeTrigger, setActiveTrigger] = useState<TriggerEvent | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleTrigger = (e: CustomEvent<TriggerEvent>) => {
      setActiveTrigger(e.detail);
    };

    window.addEventListener('proactive-trigger' as any, handleTrigger);
    return () => window.removeEventListener('proactive-trigger' as any, handleTrigger);
  }, []);

  if (!activeTrigger) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden"
      >
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-start justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            <h3 className="font-bold">{activeTrigger.title}</h3>
          </div>
          <button 
            onClick={() => setActiveTrigger(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-slate-600 mb-4">
            {activeTrigger.message}
          </p>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Bot size={16} />
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-100">
              <p className="text-xs text-slate-500 italic">
                "{t('dashboard.proactiveMessage')}"
              </p>
            </div>
          </div>
          
          {activeTrigger.actionLabel && (
            <button
              onClick={() => {
                activeTrigger.onAction?.();
                setActiveTrigger(null);
              }}
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              {activeTrigger.actionLabel} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
