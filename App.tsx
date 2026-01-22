import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import AdminPanel from './components/AdminPanel';
import { getConfig } from './services/storageService';

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(true);
  // Get config once at startup (Admin panel handles updates via reload)
  const config = getConfig();

  return (
    <div className="min-h-screen relative">
      
      {/* Top Navigation Bar for Demo Purposes */}
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
        </div>
      </div>

      {/* Main Content Area */}
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
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">1</div>
                      <h4 className="font-semibold text-gray-900">Tư vấn 24/7</h4>
                      <p className="text-sm text-gray-500 mt-1">AI luôn sẵn sàng trả lời mọi câu hỏi.</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-3">2</div>
                      <h4 className="font-semibold text-gray-900">Dữ liệu riêng</h4>
                      <p className="text-sm text-gray-500 mt-1">Trả lời chính xác dựa trên PDF bạn upload.</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3">3</div>
                      <h4 className="font-semibold text-gray-900">Dễ dàng nhúng</h4>
                      <p className="text-sm text-gray-500 mt-1">Chỉ cần 1 đoạn mã JS đơn giản.</p>
                    </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* The Actual Widget (Always rendered but visible in User Mode logic usually, here we keep it mounted to show it floats) */}
      <ChatWidget config={config} />
      
    </div>
  );
};

export default App;