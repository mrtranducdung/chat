import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import copy from 'copy-to-clipboard';
import { Message, Sender, Language, Feedback, AppConfig } from '../../types';
import { generateResponseStream, detectLanguage } from '../../services/mistralService';
import { saveFeedback } from '../../services/storageService';

// ─── Sales helpers ────────────────────────────────────────────────────────────
const SALES_KEYWORDS = [
  'doanh thu', 'bán hàng', 'kinh doanh', 'doanh số',
  'sản phẩm', 'top', 'khu vực', 'nhân viên', 'đơn hàng',
  'tháng', 'tuần', 'biểu đồ', 'thống kê', 'tổng hợp', 'báo cáo',
  'revenue', 'sales', 'orders', 'products', 'chart', 'report',
];

const isSalesQuestion = (text: string) =>
  SALES_KEYWORDS.some(kw => text.toLowerCase().includes(kw));

const fetchSalesData = async (baseUrl: string) => {
  const res = await fetch(`${baseUrl}/api/sales/summary`);
  if (!res.ok) throw new Error('Sales service unavailable');
  return res.json();
};

const buildSalesContext = (d: any): string => `
[DỮ LIỆU BÁN HÀNG THỰC TẾ]
Tổng doanh thu: ${d.totalRevenue?.toLocaleString('vi-VN')} ₫
Tổng đơn hoàn thành: ${d.totalOrders}

Doanh thu theo tháng:
${d.revenueByMonth?.map((r: any) => `  ${r.month}: ${r.revenue?.toLocaleString('vi-VN')} ₫`).join('\n')}

Top 5 sản phẩm:
${d.topProducts?.map((p: any, i: number) => `  ${i + 1}. ${p.name} — ${p.revenue?.toLocaleString('vi-VN')} ₫ (${p.total_sold} cái)`).join('\n')}

Doanh thu theo khu vực:
${d.revenueByRegion?.map((r: any) => `  ${r.region}: ${r.revenue?.toLocaleString('vi-VN')} ₫`).join('\n')}

Doanh thu theo nhân viên:
${d.revenueByStaff?.map((s: any) => `  ${s.name}: ${s.revenue?.toLocaleString('vi-VN')} ₫`).join('\n')}
[END DỮ LIỆU]
`;

const pickChart = (question: string, d: any) => {
  const q = question.toLowerCase();
  if (q.includes('tháng') || q.includes('month') || q.includes('trend'))
    return { chartType: 'line' as const, data: d.revenueByMonth, xKey: 'month', yKey: 'revenue', title: 'Doanh thu theo tháng' };
  if (q.includes('khu vực') || q.includes('region'))
    return { chartType: 'pie' as const, data: d.revenueByRegion, xKey: 'region', yKey: 'revenue', title: 'Doanh thu theo khu vực' };
  if (q.includes('nhân viên') || q.includes('staff'))
    return { chartType: 'bar' as const, data: d.revenueByStaff, xKey: 'name', yKey: 'revenue', title: 'Doanh thu theo nhân viên' };
  if (q.includes('sản phẩm') || q.includes('product') || q.includes('top'))
    return { chartType: 'bar' as const, data: d.topProducts, xKey: 'name', yKey: 'revenue', title: 'Top sản phẩm bán chạy' };
  // default: monthly line chart
  return { chartType: 'line' as const, data: d.revenueByMonth, xKey: 'month', yKey: 'revenue', title: 'Doanh thu theo tháng' };
};
// ─────────────────────────────────────────────────────────────────────────────

const findLastUserQuery = (msgs: Message[], botMsgIndex: number): string => {
  for (let i = botMsgIndex - 1; i >= 0; i--) {
    if (msgs[i].sender === Sender.USER) return msgs[i].text;
  }
  return '';
};

export const useChatLogic = (config: AppConfig, isEmbedded: boolean) => {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [language, setLanguage] = useState<Language>(config.defaultLanguage || 'vi');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationId, setConversationId] = useState(Date.now().toString());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    text: config.welcomeMessage,
    sender: Sender.BOT,
    timestamp: Date.now(),
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      if (!isEmbedded) document.title = 'Gemini AI Chatbot Widget';
    }
  }, [isOpen, isEmbedded]);

  useEffect(() => {
    const saved = localStorage.getItem(`chat_history_${config.tenantId}`);
    if (saved && !isEmbedded) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 1) setMessages(parsed);
      } catch { console.warn('Failed to load chat history'); }
    }
  }, [config.tenantId, isEmbedded]);

  useEffect(() => {
    if (messages.length > 1 && !isEmbedded)
      localStorage.setItem(`chat_history_${config.tenantId}`, JSON.stringify(messages));
  }, [messages, config.tenantId, isEmbedded]);

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); toast.success(language === 'vi' ? 'Đã kết nối lại' : language === 'ja' ? '再接続しました' : 'Back online', { duration: 2000 }); };
    const onOffline = () => { setIsOnline(false); toast.error(language === 'vi' ? 'Mất kết nối internet' : language === 'ja' ? 'インターネット接続が切れました' : 'You are offline', { duration: 3000 }); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, [language]);

  const incrementUnread = () => {
    if (!isOpen && !isEmbedded) {
      setUnreadCount(prev => {
        const n = prev + 1;
        document.title = `(${n}) Tin nhắn mới - Gemini Chatbot`;
        return n;
      });
      if (config.enableSound && audioRef.current)
        audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
    }
  };

  const handleFeedback = (messageId: string, text: string, type: Feedback) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    const userQuery = findLastUserQuery(messages, msgIndex);
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, feedback: type } : msg));
    saveFeedback(messageId, text, type, userQuery);
    toast.success(
      type === 'up'
        ? (language === 'vi' ? 'Cảm ơn phản hồi!' : language === 'ja' ? 'フィードバックありがとう！' : 'Thanks for your feedback!')
        : (language === 'vi' ? 'Chúng tôi sẽ cải thiện' : language === 'ja' ? '改善に努めます' : "We'll improve"),
      { duration: 2000 }
    );
  };

  const copyToClipboard = (text: string) => {
    const ok = copy(text);
    ok
      ? toast.success(language === 'vi' ? 'Đã sao chép!' : language === 'ja' ? 'コピーしました！' : 'Copied to clipboard!', { duration: 2000, position: 'top-center' })
      : toast.error(language === 'vi' ? 'Không thể sao chép' : language === 'ja' ? 'コピー失敗' : 'Failed to copy', { duration: 2000 });
  };

  const startNewConversation = () => {
    setMessages([{ id: 'welcome', text: config.welcomeMessage, sender: Sender.BOT, timestamp: Date.now() }]);
    localStorage.removeItem(`chat_history_${config.tenantId}`);
    setConversationId(Date.now().toString());
    setError(null);
    setRetryMessage(null);
    toast.success(language === 'vi' ? 'Bắt đầu cuộc trò chuyện mới' : language === 'ja' ? '新しい会話を開始しました' : 'Started new conversation', { duration: 2000 });
  };

  const regenerateResponse = async (messageId: string) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const userQuery = findLastUserQuery(messages, msgIndex);
    if (!userQuery) return;
    setMessages(prev => prev.slice(0, msgIndex));
    toast.loading(language === 'vi' ? 'Đang tạo lại...' : language === 'ja' ? '再生成中...' : 'Regenerating...', { duration: 1000 });
    setTimeout(() => handleSendMessage(userQuery), 500);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (window.parent !== window) window.parent.postMessage('GEMINIBOT_CLOSE', '*');
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue.trim();
    if (!textToSend || isTyping) return;

    if (!isOnline) {
      toast.error(language === 'vi' ? 'Không có kết nối internet' : language === 'ja' ? 'インターネット接続がありません' : 'No internet connection', { duration: 3000 });
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), text: textToSend, sender: Sender.USER, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setError(null);
    setRetryMessage(null);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, text: '', sender: Sender.BOT, timestamp: Date.now() }]);

    try {
      // ── Detect language ──────────────────────────────────────────────────
      let usedLanguage = language;
      if (textToSend.length > 2) {
        try {
          const detected = await detectLanguage(textToSend);
          if (detected !== language) { setLanguage(detected); usedLanguage = detected; }
        } catch { console.warn('Skipping language detection'); }
      }

      // ── Sales data injection ─────────────────────────────────────────────
      let salesContext = '';
      let salesChart: Message['chartData'] = undefined;

      if (config.salesServiceUrl && isSalesQuestion(textToSend)) {
        try {
          const salesData = await fetchSalesData(config.salesServiceUrl);
          salesContext = buildSalesContext(salesData);
          salesChart = pickChart(textToSend, salesData);
        } catch (e) {
          console.warn('Sales service error, skipping chart:', e);
        }
      }

      // ── Stream response ──────────────────────────────────────────────────
      const promptText = salesContext
        ? `${salesContext}\n\nCâu hỏi: ${textToSend}`
        : textToSend;

      const stream = generateResponseStream(
        [...messages, userMsg],
        promptText,
        [],
        config.botName,
        usedLanguage
      );

      let fullText = '';
      let ragMetadata = { used: false, chunksCount: 0, similarity: 0 };

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, text: fullText } : msg));
      }

      try {
        const final = await stream.next();
        if (final.done && final.value) ragMetadata = final.value;
      } catch { /* stream already done */ }

      // ── Finalize message with chart + RAG metadata ───────────────────────
      setMessages(prev => prev.map(msg => msg.id === botMsgId ? {
        ...msg,
        ragUsed: ragMetadata.used,
        ragChunks: ragMetadata.chunksCount,
        ragSimilarity: ragMetadata.similarity,
        chartData: salesChart,
      } : msg));

      incrementUnread();

    } catch (err) {
      console.error(err);
      setError(language === 'vi' ? 'Không thể kết nối' : language === 'ja' ? '接続に失敗しました' : 'Connection failed');
      setRetryMessage(textToSend);
      setMessages(prev => prev.map(msg => msg.id === botMsgId ? {
        ...msg,
        text: language === 'vi' ? '❌ Không thể kết nối. Vui lòng thử lại.' : language === 'ja' ? '❌ 接続に失敗しました。再試行してください。' : '❌ Connection failed. Please try again.',
      } : msg));
      toast.error(language === 'vi' ? 'Lỗi kết nối' : language === 'ja' ? '接続エラー' : 'Connection error', { duration: 3000 });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleRetry = () => {
    if (retryMessage) { setError(null); handleSendMessage(retryMessage); }
  };

  return {
    isOpen, setIsOpen,
    language, setLanguage,
    isLangMenuOpen, setIsLangMenuOpen,
    unreadCount,
    isOnline,
    error, retryMessage,
    messages,
    inputValue, setInputValue,
    isTyping,
    messagesEndRef, scrollContainerRef, audioRef,
    handleFeedback, copyToClipboard, startNewConversation,
    regenerateResponse, handleClose, handleSendMessage,
    handleKeyDown, handleRetry,
  };
};