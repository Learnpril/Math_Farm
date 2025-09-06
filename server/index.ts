import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// In production, serve static files from the same dist directory
const staticPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '.') 
  : path.join(__dirname, '../dist');

app.use(express.static(staticPath));

// API routes will be added here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'index.html')
    : path.join(__dirname, '../dist/index.html');
  res.sendFile(indexPath);
});

// Start HTTP server (proxy handles SSL)
app.listen(PORT, () => {
  console.log(`Math Farm server running on port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
});