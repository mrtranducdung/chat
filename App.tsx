import React, { useState, useEffect } from 'react';
import ChatWidget from './components/ChatWidget';
import AdminPanel from './components/AdminPanel';
import { getConfig, isAuthenticated, logout } from './services/storageService';

const API_URL = import.meta.env.VITE_API_URL || 'https://geminibot-backend.onrender.com/api';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [isAdminMode, setIsAdminMode] = useState(true);
  const config = getConfig();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  if (!isLoggedIn) {
    return <AuthPage onAuthSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen relative">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm relative z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
          <h1 className="text-xl font-bold text-gray-800">Gemini<span className="text-blue-600">Bot</span> Platform</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:inline">Chế độ xem:</span>
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setIsAdminMode(true)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isAdminMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setIsAdminMode(false)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isAdminMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              User Website
            </button>
          </div>
          <button
            onClick={() => {
              logout();
              setIsLoggedIn(false);
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        {isAdminMode ? (
          <div className="animate-fade-in">
            <AdminPanel />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Đây là Website Khách Hàng</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Trang này mô phỏng website đích mà chatbot sẽ được gắn vào.
                Hãy nhìn xuống góc phải màn hình để trải nghiệm Chatbot.
              </p>
            </div>
          </div>
        )}
      </main>

      <ChatWidget config={config} />
    </div>
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
        throw new Error('All fields are required');
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Sign in to GeminiBot Platform' : 'Create your account'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Slug (URL)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@test.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
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
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;