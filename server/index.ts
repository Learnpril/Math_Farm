import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { initializeWebSocket } from './websocket/websocket-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server for WebSocket integration
const server = createServer(app);

// Security middleware
app.use((_req, res, next) => {
  // Security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware
app.use(express.json());

// Fix MIME types for various file types
app.use((req, res, next) => {
  const url = req.url.toLowerCase();

  // Worker files
  if (url.includes('worker') || url.includes('math-worker')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  // TypeScript files served as JavaScript
  else if (url.endsWith('.ts') && !url.includes('.d.ts')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  // JavaScript modules
  else if (url.endsWith('.js') || url.endsWith('.mjs')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  // JSON files
  else if (url.endsWith('.json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  // CSS files
  else if (url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  }
  // HTML files
  else if (url.endsWith('.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  }

  next();
});

// In production, serve static files from the same dist directory
const staticPath =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '.')
    : path.join(__dirname, '../dist');

app.use(
  express.static(staticPath, {
    setHeaders: (res, path) => {
      // Set proper MIME types for worker files
      if (path.includes('worker') || path.includes('math-worker')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    },
  })
);

// Import forum routes
import forumRoutes from './routes/forum/index.js';

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount forum routes
app.use('/api/forum', forumRoutes);

// Serve React app for all other routes
app.get('*', (_req, res) => {
  const indexPath =
    process.env.NODE_ENV === 'production'
      ? path.join(__dirname, 'index.html')
      : path.join(__dirname, '../dist/index.html');
  res.sendFile(indexPath);
});

// Initialize WebSocket server
const wsServer = initializeWebSocket(server);

// Start HTTP server (proxy handles SSL)
server.listen(PORT, () => {
  console.log(
    `Math Farm server running on port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`
  );
  console.log(
    `WebSocket server initialized at ws://localhost:${PORT}/ws/forum`
  );
});
