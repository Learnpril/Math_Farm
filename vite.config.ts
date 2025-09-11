import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // Minimal, safe settings to avoid build errors
    minify: false,
    target: "es2020",
    sourcemap: false,
    cssMinify: false,
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  // Standard dependency optimization
  optimizeDeps: {
    include: ["react", "react-dom", "wouter"],
  },
});
