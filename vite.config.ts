import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Bundle analysis plugin for monitoring build output sizes
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  // Web Worker support
  worker: {
    format: 'es',
    plugins: [
      // Enable React plugin for workers if needed
    ],
  },
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Production optimizations without minification
    minify: false, // No minification as requested
    target: 'es2020',
    sourcemap: true, // Enable source maps for debugging
    cssMinify: false, // No CSS minification as requested
    chunkSizeWarningLimit: 1000, // Lower warning limit to catch large chunks
    // Advanced rollup options for code splitting and chunk optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting strategy for optimal loading
        manualChunks: {
          // Vendor chunk for React and core libraries
          vendor: ['react', 'react-dom', 'wouter'],
          // Math libraries chunk for lazy loading
          math: ['mathjax', 'better-react-mathjax'],
          // Interactive components chunk
          interactive: ['jsxgraph'],
          // UI components chunk
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            'lucide-react',
          ],
          // Query and state management
          query: ['@tanstack/react-query'],
        },
        // Optimize chunk file names for caching
        chunkFileNames: chunkInfo => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split('/')
                .pop()
                ?.replace(/\.[^/.]+$/, '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: assetInfo => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext || '')) {
            return `css/[name]-[hash][extname]`;
          }
          if (/woff2?|ttf|eot/i.test(ext || '')) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      // Tree-shaking configuration
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    host: true,
    force: true, // Force dependency re-optimization
  },
  // Enhanced dependency optimization for better performance
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      '@tanstack/react-query',
      'clsx',
      'tailwind-merge',
    ],
    // Exclude math libraries from pre-bundling to avoid Node.js compatibility issues
    exclude: [
      'mathjs',
      'nerdamer',
      'javascript-natural-sort',
      'mathjax',
      'better-react-mathjax',
      'jsxgraph',
    ],
  },
  // Asset optimization
  assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf'],
  // Performance optimizations without minification
  esbuild: {
    // Remove unused imports and optimize for production
    treeShaking: true,
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
  },
});
