import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'vi' | 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    'menu.dashboard': 'Bảng điều khiển',
    'menu.admin': 'Quản trị',
    'menu.settings': 'Cài đặt',
    'chatbot.title': 'Trợ lý AI Doanh nghiệp',
    'chatbot.placeholder': 'Nhập tin nhắn...',
    'chatbot.send': 'Gửi',
    'home.announcements': 'Thông báo quan trọng',
    'home.todo': 'Việc cần làm',
    'home.calendar': 'Lịch trình',
    'home.quickAccess': 'Lối tắt',
    'home.lineConnect': 'Kết nối Line',
    'dashboard.finance': 'Tài chính',
    'dashboard.operations': 'Vận hành & Thị trường',
    'dashboard.hr': 'Nhân sự & DX',
    'admin.users': 'Quản lý người dùng',
    'admin.data': 'Dữ liệu & RAG',
    'admin.master': 'Danh mục Master',
    'admin.approval': 'Phê duyệt (Ringi-sho)',
    'admin.botSettings': 'Cài đặt AI Bot',
    'admin.integrations': 'Kết nối ứng dụng',
    'admin.audit': 'Lịch sử hệ thống',
    'messages.internal': 'Hộp thư nội bộ',
    'messages.feedback': 'Phản hồi khách hàng',
    'messages.emergency': 'Liên lạc khẩn cấp',
    'messages.files': 'Lưu trữ tài liệu',
    'settings.profile': 'Hồ sơ doanh nghiệp',
    'settings.goals': 'Thiết lập mục tiêu',
    'settings.notifications': 'Cấu hình thông báo',
    'settings.security': 'Bảo mật & Ngôn ngữ',
    'auth.changePassword': 'Đổi mật khẩu',
    'auth.logout': 'Đăng xuất',
    'auth.currentPassword': 'Mật khẩu hiện tại',
    'auth.newPassword': 'Mật khẩu mới',
    'auth.confirmPassword': 'Xác nhận mật khẩu mới',
    'auth.cancel': 'Hủy',
    'auth.update': 'Cập nhật',
    'auth.passwordMismatch': 'Mật khẩu mới không khớp.',
    'auth.passwordLength': 'Mật khẩu mới phải có ít nhất 6 ký tự.',
    'auth.passwordSuccess': 'Đổi mật khẩu thành công!',
  },
  ja: {
    'menu.dashboard': 'ダッシュボード',
    'menu.admin': '管理',
    'menu.settings': '設定',
    'chatbot.title': 'AIビジネスアシスタント',
    'chatbot.placeholder': 'メッセージを入力...',
    'chatbot.send': '送信',
    'home.announcements': '重要なお知らせ',
    'home.todo': 'To-Doリスト',
    'home.calendar': 'カレンダー',
    'home.quickAccess': 'クイックアクセス',
    'home.lineConnect': 'LINE連携',
    'dashboard.finance': '財務',
    'dashboard.operations': '市場と運用',
    'dashboard.hr': '人事とDX',
    'admin.users': 'ユーザー管理',
    'admin.data': 'データとRAG',
    'admin.master': 'マスターデータ',
    'admin.approval': '稟議書',
    'admin.botSettings': 'AIボット設定',
    'admin.integrations': 'アプリ連携',
    'admin.audit': '監査ログ',
    'messages.internal': '社内チャット',
    'messages.feedback': 'お客様の声',
    'messages.emergency': '緊急連絡',
    'messages.files': '共有ファイル',
    'settings.profile': '会社概要',
    'settings.goals': '目標設定',
    'settings.notifications': '通知設定',
    'settings.security': 'セキュリティと多言語',
    'auth.changePassword': 'パスワード変更',
    'auth.logout': 'ログアウト',
    'auth.currentPassword': '現在のパスワード',
    'auth.newPassword': '新しいパスワード',
    'auth.confirmPassword': '新しいパスワード（確認）',
    'auth.cancel': 'キャンセル',
    'auth.update': '更新',
    'auth.passwordMismatch': '新しいパスワードが一致しません。',
    'auth.passwordLength': '新しいパスワードは6文字以上である必要があります。',
    'auth.passwordSuccess': 'パスワードが正常に変更されました！',
  },
  en: {
    'menu.dashboard': 'Dashboard',
    'menu.admin': 'Admin',
    'menu.settings': 'Settings',
    'chatbot.title': 'AI Business Agent',
    'chatbot.placeholder': 'Type a message...',
    'chatbot.send': 'Send',
    'home.announcements': 'Announcements',
    'home.todo': 'To-do List',
    'home.calendar': 'Calendar',
    'home.quickAccess': 'Quick Access',
    'home.lineConnect': 'Line Integration',
    'dashboard.finance': 'Finance',
    'dashboard.operations': 'Operations & Market',
    'dashboard.hr': 'HR & DX',
    'admin.users': 'Users Management',
    'admin.data': 'Data & RAG',
    'admin.master': 'Master Data',
    'admin.approval': 'Approval Flows',
    'admin.botSettings': 'AI Bot Settings',
    'admin.integrations': 'App Integrations',
    'admin.audit': 'Audit Logs',
    'messages.internal': 'Internal Chat',
    'messages.feedback': 'Customer Feedback',
    'messages.emergency': 'Emergency Alerts',
    'messages.files': 'Shared Files',
    'settings.profile': 'Company Profile',
    'settings.goals': 'Goal Setting',
    'settings.notifications': 'Notifications',
    'settings.security': 'Security & Language',
    'auth.changePassword': 'Change Password',
    'auth.logout': 'Logout',
    'auth.currentPassword': 'Current Password',
    'auth.newPassword': 'New Password',
    'auth.confirmPassword': 'Confirm New Password',
    'auth.cancel': 'Cancel',
    'auth.update': 'Update',
    'auth.passwordMismatch': 'New passwords do not match.',
    'auth.passwordLength': 'New password must be at least 6 characters.',
    'auth.passwordSuccess': 'Password changed successfully!',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('lang') as Language) || 'ja'
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
