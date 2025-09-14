/// <reference types="vitest/config" />
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['server/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/server',
      include: ['server/**/*.{ts,js}'],
      exclude: [
        'node_modules/',
        'server/**/*.d.ts',
        'server/**/*.config.*',
        'server/**/__tests__/**',
        'server/**/*.test.*',
        'server/**/*.spec.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './server'),
    },
  },
});
