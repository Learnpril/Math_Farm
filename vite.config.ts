import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Disable all minification
    minify: false,
    cssMinify: false,
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Preserve original formatting and names
        compact: false,
        minifyInternalExports: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  // Disable minification at transform level
  esbuild: {
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
    target: 'es2020',
  },
  // Fix worker loading issues
  worker: {
    format: 'es',
    plugins: [react()],
  },
  // Serve static files properly
  publicDir: '../attached_assets',
  server: {
    fs: {
      allow: ['..'],
    },
  },
});
