import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Maximum readability settings
    rollupOptions: {
      output: {
        format: 'es',
        // Preserve original names as much as possible
        preserveModules: false,
        compact: false,
        // Keep readable chunk names
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        // Manual chunk splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['wouter'],
          'ui-vendor': ['@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'math-vendor': ['mathjs'],
          'utils-vendor': ['clsx', 'class-variance-authority', 'tailwind-merge'],
          'mathjax-chunk': ['better-react-mathjax'],
        },
      },
      // Disable optimizations
      treeshake: false,
    },
    // No minification
    minify: false,
    target: 'esnext',
    sourcemap: true,
    cssMinify: false,
    chunkSizeWarningLimit: 10000,
    cssCodeSplit: true,
    assetsInlineLimit: 0,
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