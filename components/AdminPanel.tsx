import React, { useState, useEffect, useMemo } from 'react';
import { UploadIcon, TrashIcon, SettingsIcon, CodeIcon, MagicIcon, BarChartIcon, ThumbsUpIcon, ThumbsDownIcon, SearchIcon, PlusIcon, FileIcon, CheckCircleIcon, XIcon } from './Icons';
import { KnowledgeItem, AppConfig, FeedbackLog, FeedbackAnalysisResult, DEFAULT_CONFIG } from '../types';
import { getKnowledgeBase, saveKnowledgeItem, deleteKnowledgeItem, getConfig, saveConfig, getFeedbackLogs, analyzeFeedbackTrends } from '../services/storageService';
import { analyzeDocument } from '../services/geminiService';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'settings' | 'install' | 'feedback'>('knowledge');
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackLog[]>([]);
  const [config, setConfig] = useState<AppConfig>(getConfig());
  
  // Settings State (Local edit before save)
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [newQuestion, setNewQuestion] = useState('');

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<FeedbackAnalysisResult | null>(null);
  const [isAnalyzingFeedback, setIsAnalyzingFeedback] = useState(false);

  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            if (activeTab === 'knowledge') {
                const data = await getKnowledgeBase();
                setKnowledgeList(data);
            } else if (activeTab === 'feedback') {
                const data = await getFeedbackLogs();
                setFeedbackLogs(data.sort((a, b) => b.timestamp - a.timestamp));
            }
            const currentConfig = getConfig();
            setConfig(currentConfig);
            setLocalConfig(currentConfig);
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setIsLoadingData(false);
        }
    };
    fetchData();
  }, [activeTab]); 

  // Filter Knowledge Base
  const filteredKnowledge = useMemo(() => {
    return knowledgeList.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [knowledgeList, searchTerm]);

  const handleRunFeedbackAnalysis = async () => {
      setIsAnalyzingFeedback(true);
      try {
          const result = await analyzeFeedbackTrends();
          setAnalysisResult(result);
      } catch (e) {
          alert("Lỗi phân tích feedback");
      } finally {
          setIsAnalyzingFeedback(false);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadTitle(file.name); 

    try {
      if (file.type === "application/pdf") {
        await handlePdfUpload(file);
      } else {
        await handleTextUpload(file);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đọc file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextUpload = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUploadText(content);
        resolve();
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handlePdfUpload = async (file: File) => {
    try {
       // @ts-ignore
       if (!window.pdfjsLib) {
         alert("Thư viện PDF chưa tải xong.");
         return;
       }
       const arrayBuffer = await file.arrayBuffer();
       // @ts-ignore
       const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
       let fullText = '';
       for (let i = 1; i <= pdf.numPages; i++) {
         const page = await pdf.getPage(i);
         const textContent = await page.getTextContent();
         // @ts-ignore
         const pageText = textContent.items.map((item) => item.str).join(' ');
         fullText += pageText + '\n\n';
       }
       setUploadText(fullText);
    } catch (e) {
      alert("Không thể đọc file PDF.");
    }
  };

  const handleAnalyze = async () => {
    if (!uploadText.trim()) return alert("Vui lòng nhập nội dung.");
    setIsAnalyzing(true);
    try {
      const result = await analyzeDocument(uploadText);
      setUploadTitle(result.title);
    } catch (e) {
      alert("Lỗi phân tích AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToKnowledge = async () => {
    if (!uploadTitle.trim() || !uploadText.trim()) return;
    setIsProcessing(true);
    const newItem: KnowledgeItem = {
      id: "", 
      tenantId: "",
      title: uploadTitle,
      content: uploadText,
      dateAdded: 0,
      fileName: uploadTitle.endsWith('.pdf') || uploadTitle.endsWith('.txt') ? uploadTitle : undefined
    };
    try {
        const updatedList = await saveKnowledgeItem(newItem);
        setKnowledgeList(updatedList);
        setUploadTitle('');
        setUploadText('');
        setShowUpload(false); 
        alert("Đã lưu vào server thành công!");
    } catch (e) {
        alert("Lỗi khi lưu.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      const updated = await deleteKnowledgeItem(id);
      setKnowledgeList(updated);
    }
  };

  // Config Handlers
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setLocalConfig(prev => ({
        ...prev,
        suggestedQuestions: [...(prev.suggestedQuestions || []), newQuestion.trim()]
    }));
    setNewQuestion('');
  };

  const handleRemoveQuestion = (idx: number) => {
    setLocalConfig(prev => ({
        ...prev,
        suggestedQuestions: prev.suggestedQuestions?.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveConfig = () => {
    saveConfig(localConfig);
    setConfig(localConfig);
    alert("Cài đặt đã được lưu!");
    window.location.reload(); 
  };

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
            activeTab === id 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
        <Icon className={`w-5 h-5 ${activeTab === id ? 'text-white' : 'text-gray-400'}`} />
        <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[800px]">
      
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-white border-r border-gray-100 flex flex-col p-6 z-10">
        <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Gemini<span className="text-blue-600">Admin</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">Enterprise Knowledge Hub</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          <SidebarItem id="knowledge" label="Dữ liệu (RAG)" icon={FileIcon} />
          <SidebarItem id="feedback" label="Phản hồi & Đánh giá" icon={BarChartIcon} />
          <SidebarItem id="settings" label="Cấu hình & Gợi ý" icon={SettingsIcon} />
          <div className="pt-4 mt-4 border-t border-gray-100">
             <SidebarItem id="install" label="Hướng dẫn cài đặt" icon={CodeIcon} />
          </div>
        </nav>

        <div className="mt-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500">
                    <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase">System Status</h4>
                    <p className="text-[10px] text-green-600 font-medium">All systems operational</p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50/50 p-8 overflow-y-auto">
        {isLoadingData ? (
            <div className="flex h-full items-center justify-center flex-col gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 font-medium animate-pulse">Đang đồng bộ dữ liệu...</span>
            </div>
        ) : (
            <div className="max-w-4xl mx-auto animate-fade-in">
                
                {/* KNOWLEDGE TAB */}
                {activeTab === 'knowledge' && (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
                            <p className="text-gray-500 text-sm mt-1">Quản lý tài liệu nguồn để AI học tập.</p>
                        </div>
                        <button 
                            onClick={() => setShowUpload(!showUpload)} 
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                                showUpload 
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-0.5'
                            }`}
                        >
                            {showUpload ? <XIcon className="w-5 h-5"/> : <PlusIcon className="w-5 h-5"/>}
                            {showUpload ? 'Hủy bỏ' : 'Thêm tài liệu'}
                        </button>
                    </div>

                    {showUpload && (
                        <div className="mb-8 bg-white border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-50/50 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <UploadIcon className="w-5 h-5 text-blue-500"/> Upload Tài Liệu Mới
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 flex flex-col items-center justify-center p-6 text-center hover:bg-blue-50 transition-colors relative group min-h-[200px]">
                                    <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                        <UploadIcon className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <span className="font-semibold text-gray-700">Kéo thả hoặc chọn file</span>
                                    <span className="text-xs text-gray-400 mt-1">Hỗ trợ PDF, TXT, MD, JSON</span>
                                    <input type="file" accept=".txt,.md,.json,.pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 rounded-xl">
                                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                            <span className="text-xs font-bold text-blue-600">Đang xử lý...</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tiêu đề tài liệu</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={uploadTitle} 
                                                onChange={(e) => setUploadTitle(e.target.value)} 
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                                placeholder="VD: Chính sách bảo hành..." 
                                            />
                                            <button 
                                                onClick={handleAnalyze} 
                                                disabled={isAnalyzing || !uploadText} 
                                                className="px-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors"
                                            >
                                                {isAnalyzing ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div> : <MagicIcon className="w-5 h-5"/>}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nội dung (Preview)</label>
                                         <textarea 
                                            value={uploadText} 
                                            onChange={(e) => setUploadText(e.target.value)} 
                                            className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            placeholder="Nội dung file sẽ hiện tại đây..."
                                         ></textarea>
                                    </div>

                                    <button 
                                        onClick={handleAddToKnowledge} 
                                        disabled={isProcessing || !uploadText.trim()} 
                                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                                    >
                                        Lưu & Embed Vector
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                         <div className="flex gap-4">
                            <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                                <span className="text-xs text-gray-400 font-bold uppercase">Tổng số file</span>
                                <span className="text-xl font-bold text-gray-800">{knowledgeList.length}</span>
                            </div>
                         </div>
                         <div className="flex-1 relative group">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm tài liệu..." 
                                className="w-full h-full pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                            />
                         </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {filteredKnowledge.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <SearchIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-gray-800 font-medium">Không tìm thấy tài liệu</h3>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredKnowledge.map(item => (
                                    <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors flex items-center gap-5 group">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm shrink-0 uppercase">
                                            {item.fileName ? item.fileName.split('.').pop()?.slice(0,3) : 'TXT'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate pr-4">{item.title}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded text-center">{new Date(item.dateAdded).toLocaleDateString()}</span>
                                                <span className="text-xs text-gray-400">• {Math.ceil(item.content.length / 1024)} KB</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
                )}

                {/* FEEDBACK TAB */}
                {activeTab === 'feedback' && (
                <>
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Feedback Center</h1>
                            <p className="text-gray-500 text-sm mt-1">Phân tích cảm xúc và phản hồi người dùng.</p>
                        </div>
                        <button 
                            onClick={handleRunFeedbackAnalysis}
                            disabled={isAnalyzingFeedback}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {isAnalyzingFeedback ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> AI đang đọc...</>
                            ) : (
                                <><MagicIcon className="w-5 h-5"/> Phân tích bằng AI</>
                            )}
                        </button>
                    </div>

                    {analysisResult && (
                        <div className="mb-8 bg-white rounded-2xl p-8 shadow-xl border border-indigo-100 relative overflow-hidden animate-fade-in">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            
                            <div className="relative z-10">
                                <h4 className="text-indigo-900 font-bold mb-6 flex items-center gap-2 text-lg">
                                    <MagicIcon className="w-6 h-6 text-indigo-500"/> 
                                    Báo cáo Chất lượng
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="col-span-1 border-r border-gray-100 pr-4">
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Chỉ số hài lòng</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-6xl font-black ${analysisResult.sentimentScore > 75 ? 'text-green-500' : analysisResult.sentimentScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                {analysisResult.sentimentScore}
                                            </span>
                                            <span className="text-gray-400 font-medium">/ 100</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">Dựa trên {feedbackLogs.length} lượt đánh giá</p>
                                    </div>

                                    <div className="col-span-2 pl-4">
                                         <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-50 mb-4">
                                            <span className="text-xs font-bold text-indigo-400 uppercase mb-1 block">Tóm tắt chung</span>
                                            <p className="text-gray-700 italic font-medium leading-relaxed">"{analysisResult.summary}"</p>
                                         </div>
                                         <div>
                                            <span className="text-xs font-bold text-red-400 uppercase mb-2 block">Vấn đề cần cải thiện</span>
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.commonIssues.map((issue, idx) => (
                                                    <span key={idx} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span> {issue}
                                                    </span>
                                                ))}
                                            </div>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Lịch sử đánh giá</h3>
                            <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">Mới nhất</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs font-bold text-gray-400 uppercase bg-white border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 w-16">Vote</th>
                                        <th className="px-6 py-3">User Asked</th>
                                        <th className="px-6 py-3">Bot Replied</th>
                                        <th className="px-6 py-3 w-32 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {feedbackLogs.length === 0 ? (
                                        <tr><td colSpan={4} className="p-12 text-center text-gray-400 italic">Chưa có dữ liệu.</td></tr>
                                    ) : (
                                        feedbackLogs.slice(0, 50).map((log) => (
                                            <tr key={log.timestamp} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.feedback === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {log.feedback === 'up' ? <ThumbsUpIcon className="w-4 h-4"/> : <ThumbsDownIcon className="w-4 h-4"/>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-gray-900 max-w-xs truncate" title={log.userQuery}>{log.userQuery || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-500 max-w-sm truncate group-hover:text-gray-700" title={log.text}>{log.text}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs text-gray-400 font-mono">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="max-w-3xl mx-auto py-6">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cấu hình Widget</h2>

                            <div className="space-y-4 mb-8">
                                <h3 className="font-semibold text-gray-800 border-b pb-2">Thông tin cơ bản</h3>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-1">Tên Bot</label>
                                    <input 
                                        type="text" 
                                        value={localConfig.botName}
                                        onChange={(e) => setLocalConfig({...localConfig, botName: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-1">Lời chào (Welcome)</label>
                                    <input 
                                        type="text" 
                                        value={localConfig.welcomeMessage}
                                        onChange={(e) => setLocalConfig({...localConfig, welcomeMessage: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="font-semibold text-gray-800 border-b pb-2">Gợi ý câu hỏi (Suggested Chips)</h3>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        placeholder="Nhập câu hỏi gợi ý..."
                                        className="flex-1 border rounded-lg px-3 py-2"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                                    />
                                    <button onClick={handleAddQuestion} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><PlusIcon className="w-5 h-5"/></button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {localConfig.suggestedQuestions?.map((q, idx) => (
                                        <div key={idx} className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                                            {q}
                                            <button onClick={() => handleRemoveQuestion(idx)} className="text-blue-400 hover:text-red-500"><XIcon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    {(!localConfig.suggestedQuestions || localConfig.suggestedQuestions.length === 0) && <p className="text-gray-400 text-sm italic">Chưa có câu hỏi gợi ý nào.</p>}
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveConfig} 
                                className="w-full bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Lưu cấu hình & Áp dụng
                            </button>
                        </div>
                    </div>
                )}

                {/* INSTALL TAB */}
                {activeTab === 'install' && (
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Hướng dẫn Cài đặt</h1>
                        <div className="bg-gray-900 text-gray-300 p-8 rounded-3xl font-mono text-sm shadow-2xl relative overflow-hidden border border-gray-800">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <CodeIcon className="w-32 h-32" />
                            </div>
                            
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Server Status
                                    </h4>
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                                        <p>API Endpoint: <span className="text-blue-400">http://localhost:3001/api</span></p>
                                        <p>Status: <span className="text-green-400">Online</span></p>
                                    </div>
                                </div>
                                <p className="text-xs opacity-50">Lưu ý: Đây là phiên bản multi-tenant. Mỗi tenant có dữ liệu riêng biệt.</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;