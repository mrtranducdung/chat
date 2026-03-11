import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Search, Globe, ArrowRight, Mail } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../contexts/LanguageContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const location = useLocation();
  const langRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setNavVisible(false); // scrolling down
      } else {
        setNavVisible(true); // scrolling up
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProductsOpen(false);
    setLangOpen(false);
    setIsSearchOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'JP', name: '日本語' },
    { code: 'VI', name: 'Tiếng Việt' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-white selection:bg-blue-500/30">
      {/* Top hover trigger area to show nav if hidden */}
      <div 
        className="fixed top-0 left-0 w-full h-4 z-[60]"
        onMouseEnter={() => setNavVisible(true)}
      />

      {/* Navbar */}
      <header
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-500 border-b',
          navVisible ? 'translate-y-0' : '-translate-y-full',
          isScrolled
            ? 'bg-white/80 backdrop-blur-lg border-slate-200/50 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'
            : 'bg-white/50 backdrop-blur-sm border-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all">
                A
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900">
                Agentix
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <div className="relative group">
                <button
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors py-2"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  {t('nav.products')} <ChevronDown className="w-4 h-4 opacity-70" />
                </button>
                
                {/* Dropdown */}
                <div
                  className={cn(
                    'absolute top-full left-0 pt-3 transition-all duration-300 origin-top-left',
                    productsOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-95 -translate-y-2'
                  )}
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-2 w-[320px] flex flex-col gap-1">
                    <Link
                      to="/products/dashboard-agent"
                      className="p-3 rounded-xl hover:bg-blue-50/80 transition-colors flex flex-col group/item"
                    >
                      <span className="font-semibold text-slate-900 text-sm group-hover/item:text-blue-700 transition-colors">{t('layout.products.dashboard')}</span>
                      <span className="text-xs text-slate-500 mt-1 leading-relaxed">{t('layout.products.dashboardDesc')}</span>
                    </Link>
                    <Link
                      to="/products/tax-automation-agent"
                      className="p-3 rounded-xl hover:bg-blue-50/80 transition-colors flex flex-col group/item"
                    >
                      <span className="font-semibold text-slate-900 text-sm group-hover/item:text-blue-700 transition-colors">{t('layout.products.tax')}</span>
                      <span className="text-xs text-slate-500 mt-1 leading-relaxed">{t('layout.products.taxDesc')}</span>
                    </Link>
                    <Link
                      to="/products/bpo-support-agent"
                      className="p-3 rounded-xl hover:bg-blue-50/80 transition-colors flex flex-col group/item"
                    >
                      <span className="font-semibold text-slate-900 text-sm group-hover/item:text-blue-700 transition-colors">{t('layout.products.bpo')}</span>
                      <span className="text-xs text-slate-500 mt-1 leading-relaxed">{t('layout.products.bpoDesc')}</span>
                    </Link>
                  </div>
                </div>
              </div>
              <Link to="/pricing" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                {t('nav.pricing')}
              </Link>
              <Link to="/news" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                {t('nav.news')}
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {/* Search */}
            <div className="relative flex items-center" ref={searchRef}>
              <div className={cn(
                "flex items-center overflow-hidden transition-all duration-300 ease-out",
                isSearchOpen ? "w-48 opacity-100 mr-2" : "w-0 opacity-0"
              )}>
                <input 
                  type="text" 
                  placeholder={t('nav.search')} 
                  className="w-full bg-slate-100 text-sm px-4 py-2 rounded-full outline-none border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  autoFocus={isSearchOpen}
                />
              </div>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)} 
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isSearchOpen ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                )}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-50"
              >
                <Globe className="w-4 h-4 opacity-70" />
                <span>{lang}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>
              
              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 bg-white/90 backdrop-blur-xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 py-1 overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between",
                        lang === l.code ? "bg-blue-50/80 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {l.name}
                      {lang === l.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-slate-200"></div>

            <Link to="/contact" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              {t('nav.login')}
            </Link>
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-[0_4px_10px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_15px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 flex items-center gap-2"
            >
              {t('nav.bookDemo')}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button className="text-slate-500 hover:text-blue-600">
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl py-6 px-6 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">{t('nav.products')}</div>
              <Link to="/products/dashboard-agent" className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">{t('layout.products.dashboard')}</Link>
              <Link to="/products/tax-automation-agent" className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">{t('layout.products.tax')}</Link>
              <Link to="/products/bpo-support-agent" className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">{t('layout.products.bpo')}</Link>
            </div>
            
            <div className="h-px bg-slate-100 my-1" />
            
            <Link to="/pricing" className="px-2 py-2 font-semibold text-slate-900">{t('nav.pricing')}</Link>
            <Link to="/news" className="px-2 py-2 font-semibold text-slate-900">{t('nav.news')}</Link>
            
            <div className="h-px bg-slate-100 my-1" />
            
            <div className="px-2 py-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('layout.language')}</div>
              <div className="flex gap-2">
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      lang === l.code ? "bg-blue-100 text-blue-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {l.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100 my-1" />
            <Link to="/contact" className="px-2 py-2 font-semibold text-slate-900">{t('nav.login')}</Link>
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 rounded-xl text-center font-bold mt-4 shadow-lg shadow-blue-600/20 transition-colors"
            >
              {t('nav.bookDemo')}
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        <Outlet />
      </main>

      {/* Upgraded Footer */}
      <footer className="bg-slate-50 text-slate-600 pt-24 pb-12 border-t border-slate-200 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
            <div className="col-span-1 md:col-span-12 lg:col-span-4">
              <Link to="/" className="flex items-center gap-2.5 mb-6 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all">
                  A
                </div>
                <span className="font-bold text-2xl tracking-tight text-slate-900">
                  Agentix
                </span>
              </Link>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed max-w-sm">
                {t('footer.desc')}
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="User" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="User" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">+2k</div>
                </div>
                <span className="text-xs font-medium text-slate-500">{t('footer.trusted')}</span>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-4 lg:col-span-2 lg:col-start-6">
              <h4 className="text-slate-900 font-semibold mb-6 tracking-wide">{t('footer.platform')}</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/products/dashboard-agent" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors"></span>{t('layout.products.dashboard')}</Link></li>
                <li><Link to="/products/tax-automation-agent" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors"></span>{t('layout.products.tax')}</Link></li>
                <li><Link to="/products/bpo-support-agent" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors"></span>{t('layout.products.bpo')}</Link></li>
                <li><Link to="/pricing" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors"></span>{t('nav.pricing')}</Link></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-4 lg:col-span-2">
              <h4 className="text-slate-900 font-semibold mb-6 tracking-wide">{t('footer.company')}</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/about" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors"></span>{t('footer.about')}</Link></li>
                <li><Link to="/contact" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors"></span>{t('footer.contact')}</Link></li>
                <li><Link to="/news" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors"></span>{t('footer.news')}</Link></li>
                <li><Link to="/contact" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors"></span>{t('footer.blog')}</Link></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-4 lg:col-span-3">
              <h4 className="text-slate-900 font-semibold mb-6 tracking-wide">{t('footer.stayUpdated')}</h4>
              <p className="text-sm text-slate-600 mb-4">{t('footer.subscribeDesc')}</p>
              <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder={t('footer.email')} 
                    className="w-full bg-white border border-slate-200 text-sm text-slate-900 px-10 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                  {t('footer.subscribe')}
                </button>
              </form>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}</span>
              <span className="hidden md:inline text-slate-300">•</span>
              <div className="hidden md:flex items-center gap-4">
                <Link to="/contact" className="hover:text-slate-900 transition-colors">{t('footer.privacy')}</Link>
                <Link to="/contact" className="hover:text-slate-900 transition-colors">{t('footer.terms')}</Link>
                <Link to="/contact" className="hover:text-slate-900 transition-colors">{t('footer.security')}</Link>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Link to="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </Link>
              <Link to="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </Link>
              <Link to="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
