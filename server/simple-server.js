import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use((_req, res, next) => {
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

// In production, serve static files from the dist directory
const staticPath = path.join(__dirname, '../dist');

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

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  res.sendFile(indexPath);
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(
    `Math Farm server running on port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`
  );
  console.log(`Static files served from: ${path.join(__dirname, '../dist')}`);
  console.log(`Index.html path: ${path.join(__dirname, '../dist/index.html')}`);
  console.log(`Current working directory: ${process.cwd()}`);
});
