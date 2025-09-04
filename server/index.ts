import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 443;

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

// HTTPS Configuration
if (process.env.NODE_ENV === 'production') {
  // Try to load SSL certificates
  try {
    const httpsOptions = {
      key: fs.readFileSync('/etc/ssl/private/server.key'),
      cert: fs.readFileSync('/etc/ssl/certs/server.crt')
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`HTTPS Server running on port ${PORT}`);
    });
  } catch (error) {
    console.warn('SSL certificates not found, falling back to HTTP on port 80');
    const HTTP_PORT = 80;
    app.listen(HTTP_PORT, () => {
      console.log(`HTTP Server running on port ${HTTP_PORT}`);
    });
  }
} else {
  // Development mode - use HTTP
  app.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
  });
}