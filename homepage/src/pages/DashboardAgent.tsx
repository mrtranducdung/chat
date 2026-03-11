import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, BarChart3, TrendingUp, AlertTriangle, Calendar, Bell, LineChart } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function DashboardAgent() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-slate-50 text-slate-900">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/ai-dashboard-bg/1920/1080?blur=10')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
                {t('dashboard.hero.label')}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                {t('dashboard.hero.title1')} <span className="text-blue-600">{t('dashboard.hero.title2')}</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                {t('dashboard.hero.desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://geminibot-frontend.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  Click to Demo <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                <img
                  src="https://picsum.photos/seed/ai-dashboard-hero/800/600"
                  alt="Dashboard Agent Interface"
                  className="rounded-xl border border-slate-100 w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t('dashboard.problem.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('dashboard.problem.p1.title')}</h3>
              <p className="text-slate-600">
                {t('dashboard.problem.p1.desc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('dashboard.problem.p2.title')}</h3>
              <p className="text-slate-600">
                {t('dashboard.problem.p2.desc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('dashboard.problem.p3.title')}</h3>
              <p className="text-slate-600">
                {t('dashboard.problem.p3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t('dashboard.features.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('dashboard.features.f1.title')}</h3>
              <p className="text-lg text-slate-600 mb-6">
                {t('dashboard.features.f1.desc')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{t('dashboard.features.f1.li1')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{t('dashboard.features.f1.li2')}</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <img src="https://picsum.photos/seed/ai-monitoring/600/400" alt="Monitoring" className="rounded-xl shadow-md w-full" referrerPolicy="no-referrer" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <img src="https://picsum.photos/seed/ai-alerts/600/400" alt="Alerts" className="rounded-xl shadow-md w-full" referrerPolicy="no-referrer" />
            </div>
            <div className="order-1 md:order-2">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('dashboard.features.f2.title')}</h3>
              <p className="text-lg text-slate-600 mb-6">
                {t('dashboard.features.f2.desc')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>{t('dashboard.features.f2.li1')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>{t('dashboard.features.f2.li2')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <span>{t('dashboard.features.f2.li3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">{t('dashboard.cta.title')}</h2>
          <Link
            to="/contact"
            className="inline-flex px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 rounded-full font-bold text-lg transition-colors shadow-xl"
          >
            {t('dashboard.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
