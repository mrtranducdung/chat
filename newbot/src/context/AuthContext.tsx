import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@nippon.co.jp' && password === 'admin') {
          const loggedInUser = { id: '1', name: 'Admin User', email, role: 'Admin' };
          setUser(loggedInUser);
          localStorage.setItem('user', JSON.stringify(loggedInUser));
          
          // Simulate login alert for new IP/Device
          const isNewDevice = Math.random() > 0.5;
          if (isNewDevice) {
            setLoginAlert('Cảnh báo: Đăng nhập từ thiết bị/IP mới (192.168.1.105 - Tokyo). Vui lòng kiểm tra nếu đây không phải là bạn.');
          }
          resolve();
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
