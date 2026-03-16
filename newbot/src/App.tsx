/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AgentProvider } from './context/AgentContext';
import { Sidebar } from './components/Sidebar';
import { AIChatbot } from './components/AIChatbot';
import { ProactivePopup } from './components/ProactivePopup';
import { X, Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const AgentSummary = lazy(() => import('./pages/AgentSummary').then(module => ({ default: module.AgentSummary })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full min-h-screen">
    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent = () => {
  const { isAuthenticated, loginAlert, clearLoginAlert } = useAuth();

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar />
      <main className="flex-1 md:ml-64 w-full relative">
        {loginAlert && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]">
            <span className="block sm:inline mr-4">{loginAlert}</span>
            <button onClick={clearLoginAlert} className="text-red-700 hover:text-red-900">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/agent-summary" element={<AgentSummary />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
      <AIChatbot />
      <ProactivePopup />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AgentProvider>
          <Router>
            <AppContent />
          </Router>
        </AgentProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
