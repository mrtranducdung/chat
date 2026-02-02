import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Set headers to allow iframe embedding
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.removeHeader('X-Frame-Options');
  next();
});

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});