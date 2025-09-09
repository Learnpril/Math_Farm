import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // Maximum readability settings
    rollupOptions: {
      output: {
        format: "es",
        // Preserve original names as much as possible
        preserveModules: false,
        compact: false,
        // Keep readable chunk names
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
        // Manual chunk splitting for optimal lazy loading
        manualChunks: (id) => {
          // Core React dependencies
          if (id.includes("react") || id.includes("react-dom")) {
            return "react-vendor";
          }

          // Router
          if (id.includes("wouter")) {
            return "router-vendor";
          }

          // UI components
          if (id.includes("@radix-ui")) {
            return "ui-vendor";
          }

          // Math libraries - separate chunks for lazy loading
          if (id.includes("mathjs")) {
            return "math-vendor";
          }

          if (id.includes("better-react-mathjax") || id.includes("mathjax")) {
            return "mathjax-vendor";
          }

          if (id.includes("jsxgraph")) {
            return "jsxgraph-vendor";
          }

          // Utility libraries
          if (
            id.includes("clsx") ||
            id.includes("class-variance-authority") ||
            id.includes("tailwind-merge")
          ) {
            return "utils-vendor";
          }

          // Lazy-loaded pages
          if (id.includes("pages/TopicPage")) {
            return "topic-page";
          }

          if (id.includes("pages/ToolsPage")) {
            return "tools-page";
          }

          if (id.includes("pages/LaTeXGuidePage")) {
            return "latex-guide";
          }

          if (id.includes("pages/MATLABGuidePage")) {
            return "matlab-guide";
          }

          // Tool components
          if (id.includes("tools/Calculator")) {
            return "calculator-tool";
          }

          if (id.includes("tools/GraphPlotter")) {
            return "graph-tool";
          }

          if (id.includes("tools/EquationSolver")) {
            return "solver-tool";
          }

          if (id.includes("tools/UnitConverter")) {
            return "converter-tool";
          }

          // Heavy components
          if (
            id.includes("LessonContent") ||
            id.includes("TopicPracticeSection")
          ) {
            return "lesson-components";
          }

          // Node modules that should be in vendor chunks
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
      // Disable optimizations
      treeshake: false,
    },
    // No minification
    minify: false,
    target: "esnext",
    sourcemap: true,
    cssMinify: false,
    chunkSizeWarningLimit: 10000,
    cssCodeSplit: true,
    assetsInlineLimit: 0,
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
  // Performance optimizations for development
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "wouter",
      "clsx",
      "class-variance-authority",
      "tailwind-merge",
      "lucide-react",
    ],
    exclude: [
      "better-react-mathjax", // Lazy load this
      "jsxgraph", // Dynamically loaded
      "mathjs", // Heavy math library - lazy load
    ],
  },

  // Performance settings
  esbuild: {
    // Tree shaking optimizations
    treeShaking: true,
  },
});
