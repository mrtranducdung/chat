import React, { useState, useEffect } from 'react';
import ChatWidget from './components/ChatWidget';
import AdminPanel from './components/AdminPanel';
import { getConfig, isAuthenticated, logout } from './services/storageService';
import { LangContext, Lang, useI18n, translations } from './services/i18n';

const API_URL = import.meta.env.VITE_API_URL || 'https://geminibot-backend.onrender.com/api';

const LANG_FLAGS: Record<Lang, string> = { vi: '🇻🇳', en: '🇺🇸', ja: '🇯🇵' };

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [isAdminMode, setIsAdminMode] = useState(true);
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'vi');
  const config = getConfig();

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('lang', l); };
  const t = translations[lang];

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  if (!isLoggedIn) {
    return (
      <LangContext.Provider value={{ lang, setLang }}>
        <AuthPage onAuthSuccess={() => setIsLoggedIn(true)} />
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
    <div className="min-h-screen relative">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-2 shadow-sm relative z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Gemini<span className="text-blue-600">Bot</span></h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language selector */}
          <div className="flex bg-gray-100 p-1 rounded-lg gap-0.5">
            {(['vi', 'en', 'ja'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${lang === l ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {LANG_FLAGS[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button onClick={() => setIsAdminMode(true)}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${isAdminMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.adminMode}
            </button>
            <button onClick={() => setIsAdminMode(false)}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${!isAdminMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.websiteMode}
            </button>
          </div>
          <button onClick={() => { logout(); setIsLoggedIn(false); }}
            className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium">
            {t.logout}
          </button>
        </div>
      </div>

      <main className="p-3 sm:p-6 md:p-10 max-w-7xl mx-auto">
        {isAdminMode ? (
          <div className="animate-fade-in">
            <AdminPanel />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.customerWebsiteTitle}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{t.customerWebsiteDesc}</p>
            </div>
          </div>
        )}
      </main>

      <ChatWidget config={config} />
    </div>
    </LangContext.Provider>
  );
};

// Auth Page with Login/Register Toggle
const AuthPage: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, lang, setLang } = useI18n();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('current_user', JSON.stringify(data.user));
      localStorage.setItem('current_tenant', JSON.stringify(data.tenant));

      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      if (!email || !password || !fullName || !tenantName || !tenantSlug) {
        throw new Error(t.allFieldsRequired);
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          tenantName,
          tenantSlug
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const data = await response.json();
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('current_user', JSON.stringify(data.user));
      localStorage.setItem('current_tenant', JSON.stringify(data.tenant));

      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex justify-end mb-2">
          <div className="flex bg-gray-100 p-1 rounded-lg gap-0.5">
            {(['vi', 'en', 'ja'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${lang === l ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {LANG_FLAGS[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? t.welcomeBack : t.getStarted}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? t.signInSubtitle : t.createAccountSubtitle}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.companyName}</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => {
                    setTenantName(e.target.value);
                    // Auto-generate slug
                    setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="My Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.companySlug}</label>
                <input
                  type="text"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="my-company"
                />
                <p className="text-xs text-gray-500 mt-1">This will be your unique identifier</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@test.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (isLogin ? handleLogin() : handleRegister())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={isLogin ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? t.processing : (isLogin ? t.signIn : t.createAccount)}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? t.noAccount : t.hasAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;