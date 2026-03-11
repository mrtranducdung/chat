import { ArrowRight, CheckCircle2, Users, Target, Globe, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-mono mb-8 tracking-wider uppercase">
            {t('about.mission.label')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            {t('footer.about')}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t('about.mission.desc')}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">{t('about.story.title')}</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                {t('about.story.p1')}
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {t('about.story.p2')}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">{t('about.story.year')}</h3>
                  <p className="text-slate-600 font-medium">{t('about.story.yearLabel')}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-3xl font-bold text-cyan-600 mb-2">{t('about.story.team')}</h3>
                  <p className="text-slate-600 font-medium">{t('about.story.teamLabel')}</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-100 rounded-3xl -z-10 transform rotate-2"></div>
              <img 
                src="https://picsum.photos/seed/tech-team/800/600" 
                alt="Agentix Team" 
                className="rounded-2xl shadow-xl w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              {t('about.values.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('about.values.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
              <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('about.values.v1.title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('about.values.v1.desc')}
              </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group">
              <div className="w-12 h-12 bg-white text-cyan-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('about.values.v2.title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('about.values.v2.desc')}
              </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
              <div className="w-12 h-12 bg-white text-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{t('about.values.v3.title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('about.values.v3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              {t('about.caseStudies.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('about.caseStudies.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/news" className="group block">
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src="https://picsum.photos/seed/case1/800/400" 
                    alt="Case Study 1" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-slate-900">{t('about.caseStudies.c1.title')}</h3>
                    <ArrowRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-4xl font-black text-blue-600 tracking-tighter">{t('about.caseStudies.c1.metric')}</span>
                    <span className="text-sm font-medium text-slate-500 pb-1">{t('about.caseStudies.c1.metricLabel')}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {t('about.caseStudies.c1.desc')}
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/news" className="group block">
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-cyan-300 hover:shadow-xl transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-cyan-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src="https://picsum.photos/seed/case2/800/400" 
                    alt="Case Study 2" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-slate-900">{t('about.caseStudies.c2.title')}</h3>
                    <ArrowRight className="w-5 h-5 text-cyan-600 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-4xl font-black text-cyan-600 tracking-tighter">{t('about.caseStudies.c2.metric')}</span>
                    <span className="text-sm font-medium text-slate-500 pb-1">{t('about.caseStudies.c2.metricLabel')}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {t('about.caseStudies.c2.desc')}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/cyber-security/1920/1080?blur=10')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t('about.cta.title')}</h2>
          <p className="text-xl text-blue-100 mb-10 font-medium">
            {t('about.cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-slate-50 transition-colors shadow-xl"
            >
              {t('about.cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
