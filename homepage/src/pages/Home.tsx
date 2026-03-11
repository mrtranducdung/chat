import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Users, Terminal, Cpu, Network, Database, Zap, Shield, BarChart, Clock, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden bg-slate-50 text-slate-900">
        {/* Tech grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-40 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-200/50 to-transparent blur-3xl rounded-full mix-blend-multiply"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-200/50 blur-3xl rounded-full mix-blend-multiply"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-mono mb-8 tracking-wider uppercase">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              {t('home.hero.label')}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight text-slate-900">
              {t('home.hero.title1')} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700">
                {t('home.hero.title2')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              {t('home.hero.desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
              >
                {t('home.hero.deploy')} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Terminal className="w-5 h-5 text-slate-500" /> {t('home.hero.docs')}
              </Link>
            </div>
          </motion.div>

          {/* PR Blocks instead of Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-2">10,000+</h3>
              <p className="text-slate-600 font-medium">{t('home.pr.customers')}</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-2">24/7</h3>
              <p className="text-slate-600 font-medium">{t('home.pr.support')}</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-2">99.9%</h3>
              <p className="text-slate-600 font-medium">{t('home.pr.satisfaction')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              {t('home.problem.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('home.problem.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 hover:shadow-blue-500/5 transition-all group">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('home.problem.p1.title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('home.problem.p1.desc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 hover:shadow-blue-500/5 transition-all group">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('home.problem.p2.title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('home.problem.p2.desc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 hover:shadow-blue-500/5 transition-all group">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('home.problem.p3.title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('home.problem.p3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-mono mb-6 uppercase tracking-widest">
              {t('home.solution.label')}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              {t('home.solution.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('home.solution.desc')}
            </p>
          </div>

          <div className="space-y-32">
            {/* Product 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-mono mb-6 uppercase tracking-wider">
                  {t('home.solution.m1.label')}
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t('home.solution.m1.title')}</h3>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  {t('home.solution.m1.desc')}
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{t('home.solution.m1.li1')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{t('home.solution.m1.li2')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{t('home.solution.m1.li3')}</span>
                  </li>
                </ul>
                <Link to="/products/dashboard-agent" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 group">
                  {t('home.solution.m1.link')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="absolute -inset-4 bg-blue-100 rounded-3xl -z-10 transform rotate-2"></div>
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img src="https://picsum.photos/seed/ai-business/800/600" alt="Dashboard" className="rounded-xl w-full" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>

            {/* Product 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-cyan-100 rounded-3xl -z-10 transform -rotate-2"></div>
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img src="https://picsum.photos/seed/dx-transformation/800/600" alt="Tax Automation" className="rounded-xl w-full" referrerPolicy="no-referrer" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-mono mb-6 uppercase tracking-wider">
                  {t('home.solution.m2.label')}
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t('home.solution.m2.title')}</h3>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  {t('home.solution.m2.desc')}
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                    </div>
                    <span className="font-medium">{t('home.solution.m2.li1')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                    </div>
                    <span className="font-medium">{t('home.solution.m2.li2')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                    </div>
                    <span className="font-medium">{t('home.solution.m2.li3')}</span>
                  </li>
                </ul>
                <Link to="/products/tax-automation-agent" className="inline-flex items-center gap-2 text-cyan-600 font-semibold hover:text-cyan-700 group">
                  {t('home.solution.m2.link')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Product 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono mb-6 uppercase tracking-wider">
                  {t('home.solution.m3.label')}
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{t('home.solution.m3.title')}</h3>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  {t('home.solution.m3.desc')}
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">{t('home.solution.m3.li1')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">{t('home.solution.m3.li2')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">{t('home.solution.m3.li3')}</span>
                  </li>
                </ul>
                <Link to="/products/bpo-support-agent" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 group">
                  {t('home.solution.m3.link')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="absolute -inset-4 bg-indigo-100 rounded-3xl -z-10 transform rotate-2"></div>
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img src="https://picsum.photos/seed/tech-agent/800/600" alt="BPO Support" className="rounded-xl w-full" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-white text-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              {t('home.deploy.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('home.deploy.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-blue-200/0 via-blue-300 to-blue-200/0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-8 shadow-lg relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute inset-0 bg-blue-50 group-hover:bg-blue-100 transition-colors"></div>
                <Network className="w-10 h-10 text-blue-600 relative z-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('home.deploy.s1.title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('home.deploy.s1.desc')}
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-8 shadow-lg relative overflow-hidden group hover:border-cyan-200 transition-colors">
                <div className="absolute inset-0 bg-cyan-50 group-hover:bg-cyan-100 transition-colors"></div>
                <Cpu className="w-10 h-10 text-cyan-600 relative z-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('home.deploy.s2.title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('home.deploy.s2.desc')}
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-8 shadow-lg relative overflow-hidden group hover:border-emerald-200 transition-colors">
                <div className="absolute inset-0 bg-emerald-50 group-hover:bg-emerald-100 transition-colors"></div>
                <Zap className="w-10 h-10 text-emerald-600 relative z-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('home.deploy.s3.title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('home.deploy.s3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/cyber-security/1920/1080?blur=10')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t('home.cta.title')}</h2>
          <p className="text-xl text-blue-100 mb-10 font-medium">
            {t('home.cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-slate-50 transition-colors shadow-xl"
            >
              {t('home.cta.book')}
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 hover:bg-white/10 text-white rounded-lg font-medium text-lg transition-colors backdrop-blur-sm"
            >
              {t('home.cta.consult')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
