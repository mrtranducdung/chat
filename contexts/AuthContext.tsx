import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loginAlert: string | null;
  clearLoginAlert: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loginAlert, setLoginAlert] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    const token = localStorage.getItem('auth_token');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          id: parsed.id || parsed.userId || '1',
          name: parsed.name || parsed.fullName || parsed.email || 'User',
          email: parsed.email || '',
          role: parsed.role || 'Admin',
        });
      } catch {}
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Invalid email or password');
    }

    const data = await response.json();

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('current_user', JSON.stringify(data.user));
    if (data.tenant) {
      localStorage.setItem('current_tenant', JSON.stringify(data.tenant));
    }

    setUser({
      id: data.user.id || '1',
      name: data.user.name || data.user.fullName || data.user.email,
      email: data.user.email,
      role: data.user.role || 'Admin',
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_tenant');
  };

  const clearLoginAlert = () => setLoginAlert(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loginAlert, clearLoginAlert }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
