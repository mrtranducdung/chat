import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, ShieldAlert, LogOut, KeyRound, X, Globe, ChevronDown, Presentation } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useAgent } from '../contexts/AgentContext';
import { cn } from '../utils/cn';

export const Sidebar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { agentSettings } = useAgent();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('menu.dashboard') },
    { to: '/admin', icon: ShieldAlert, label: t('menu.admin') },
    { to: '/settings', icon: Settings, label: t('menu.settings') },
    { to: '/agent-summary', icon: Presentation, label: t('menu.agentSummary') || 'Agent Summary' },
  ];

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('auth.passwordMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('auth.passwordLength'));
      return;
    }

    setTimeout(() => {
      setPasswordSuccess(t('auth.passwordSuccess'));
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('');
      }, 1500);
    }, 500);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 border-r border-slate-800 z-40">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            {agentSettings.logo ? (
              <img src={agentSettings.logo} alt="Agent Logo" className="h-8 w-auto max-w-[120px] object-contain" />
            ) : (
              <span className="bg-indigo-500 text-white p-1 rounded-md">AI</span>
            )}
            <span className="truncate">{agentSettings.name}</span>
          </h1>
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700/50"
            >
              <Globe size={14} className="text-slate-400" />
              <span className="text-xs text-slate-300 font-medium uppercase">{language}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsLangMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-28 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-20 py-1">
                  {[
                    { code: 'ja', label: '日本語' },
                    { code: 'vi', label: 'Tiếng Việt' },
                    { code: 'en', label: 'English' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setIsLangMenuOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-xs transition-colors',
                        language === lang.code
                          ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                          : 'text-slate-300 hover:bg-slate-700'
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.role}</p>
              </div>
              <ChevronDown size={16} className={cn('text-slate-400 transition-transform', isProfileMenuOpen && 'rotate-180')} />
            </button>

            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-20 py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <KeyRound size={16} />
                    {t('auth.changePassword')}
                  </button>
                  <div className="h-px bg-slate-700 my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
                  >
                    <LogOut size={16} />
                    {t('auth.logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-40 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              )
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => {
            const langs: ('ja' | 'vi' | 'en')[] = ['ja', 'vi', 'en'];
            const nextLang = langs[(langs.indexOf(language) + 1) % langs.length];
            setLanguage(nextLang);
          }}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Globe size={20} />
          <span className="text-[10px] font-medium uppercase">{language}</span>
        </button>
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">{t('auth.logout')}</span>
        </button>
      </nav>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                {t('auth.changePassword')}
              </h3>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
                  {passwordSuccess}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.currentPassword')}</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.newPassword')}</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.confirmPassword')}</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  {t('auth.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  {t('auth.update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
