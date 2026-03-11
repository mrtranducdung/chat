import React, { useState } from 'react';
import { CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col pt-24 pb-32 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column: Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-slate-600 mb-12">
              {t('contact.desc')}
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('contact.email')}</h3>
                  <p className="text-slate-600">hello@agentix.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('contact.call')}</h3>
                  <p className="text-slate-600">+1 (800) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('contact.hq')}</h3>
                  <p className="text-slate-600">123 AI Boulevard, Suite 400<br />San Francisco, CA 94105</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-4">{t('contact.next.title')}</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{t('contact.next.li1')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{t('contact.next.li2')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{t('contact.next.li3')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
            {submitted ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('contact.form.success')}</h3>
                <p className="text-slate-600 mb-8">
                  {t('contact.form.successDesc')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  {t('contact.form.another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.form.title')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.fn')}</label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.ln')}</label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.email')}</label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="jane@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.company')}</label>
                  <input
                    type="text"
                    id="company"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label htmlFor="employees" className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.size')}</label>
                  <select
                    id="employees"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">{t('contact.form.size.placeholder')}</option>
                    <option value="1">{t('contact.form.size.1')}</option>
                    <option value="2-10">{t('contact.form.size.2')}</option>
                    <option value="11-50">{t('contact.form.size.3')}</option>
                    <option value="51-100">{t('contact.form.size.4')}</option>
                    <option value="100+">{t('contact.form.size.5')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="interest" className="block text-sm font-medium text-slate-700 mb-2">{t('contact.form.interest')}</label>
                  <select
                    id="interest"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">{t('contact.form.interest.placeholder')}</option>
                    <option value="dashboard">{t('contact.form.interest.1')}</option>
                    <option value="tax">{t('contact.form.interest.2')}</option>
                    <option value="bpo">{t('contact.form.interest.3')}</option>
                    <option value="all">{t('contact.form.interest.4')}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-600/20"
                >
                  {t('contact.form.submit')}
                </button>
                <p className="text-xs text-slate-500 text-center mt-4">
                  {t('contact.form.terms')}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
