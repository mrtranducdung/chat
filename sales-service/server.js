import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './database/db.js';
import salesRoutes from './routes/sales.js';

const app = express();
const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

// Middleware
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use((req, _, next) => { console.log(`${req.method} ${req.path}`); next(); });

// Init DB
initDatabase();

// Routes
app.use('/api/sales', salesRoutes);

// Root health check
app.get('/', (_, res) => res.json({ service: 'sales-service', status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 Sales service running on http://localhost:${PORT}`);
});