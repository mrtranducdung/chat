import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Pricing() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col pt-24 pb-32 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            {t('nav.pricing')}
          </h1>
          <p className="text-xl text-slate-600">
            {t('pricing.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Individual Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('pricing.p1.title')}</h3>
              <p className="text-slate-500 text-sm">{t('pricing.p1.desc')}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">{t('pricing.p1.price')}</span>
              <span className="text-slate-500">{t('pricing.p1.period')}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>{t('pricing.p1.li1')}</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>{t('pricing.p1.li2')}</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>{t('pricing.p1.li3')}</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>{t('pricing.p1.li4')}</span>
              </li>
            </ul>
            <Link
              to="/contact"
              className="w-full py-3 px-4 bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-900 rounded-xl font-semibold text-center transition-colors"
            >
              {t('pricing.p1.button')}
            </Link>
          </div>

          {/* Startup Plan */}
          <div className="bg-blue-600 rounded-3xl p-8 shadow-xl border border-blue-500 flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {t('pricing.p2.badge')}
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{t('pricing.p2.title')}</h3>
              <p className="text-blue-200 text-sm">{t('pricing.p2.desc')}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">{t('pricing.p2.price')}</span>
              <span className="text-blue-200">{t('pricing.p2.period')}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <span>{t('pricing.p2.li1')}</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <span>{t('pricing.p2.li2')}</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <span>{t('pricing.p2.li3')}</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <span>{t('pricing.p2.li4')}</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <span>{t('pricing.p2.li5')}</span>
              </li>
            </ul>
            <Link
              to="/contact"
              className="w-full py-3 px-4 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold text-center transition-colors"
            >
              {t('pricing.p2.button')}
            </Link>
          </div>

          {/* SME Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('pricing.p3.title')}</h3>
              <p className="text-slate-500 text-sm">{t('pricing.p3.desc')}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">{t('pricing.p3.price')}</span>
              <span className="text-slate-500">{t('pricing.p3.period')}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <span>{t('pricing.p3.li1')}</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <span>{t('pricing.p3.li2')}</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <span>{t('pricing.p3.li3')}</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <span>{t('pricing.p3.li4')}</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <span>{t('pricing.p3.li5')}</span>
              </li>
            </ul>
            <Link
              to="/contact"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-center transition-colors"
            >
              {t('pricing.p3.button')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
