import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Performance optimizations
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['wouter'],
          'ui-vendor': ['@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'math-vendor': ['mathjs'],
          'utils-vendor': ['clsx', 'class-variance-authority', 'tailwind-merge'],
          // Lazy-loaded chunks (these will be loaded on demand)
          'mathjax-chunk': ['better-react-mathjax'],
        },
      },
    },
    // Enable minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Enable source maps for debugging but keep them separate
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  // Performance optimizations for development
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      'clsx',
      'class-variance-authority',
      'tailwind-merge',
      'lucide-react',
    ],
    exclude: [
      'better-react-mathjax', // Lazy load this
      'jsxgraph', // Dynamically loaded
    ],
  },
});