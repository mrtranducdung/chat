export const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://192.168.1.110:3000',
    'http://192.168.1.110:5173',
    'https://geminibot-frontend.onrender.com',
    'https://mrtranducdung.github.io'
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // ✅ CRITICAL: Expose custom headers to frontend
  res.setHeader('Access-Control-Expose-Headers', 'X-RAG-Used, X-RAG-Chunks, X-RAG-Similarity');
  
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  next();
};