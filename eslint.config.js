// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default [js.configs.recommended, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      // React globals
      React: 'readonly',

      // Browser globals
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      location: 'readonly',
      history: 'readonly',
      localStorage: 'readonly',
      sessionStorage: 'readonly',
      fetch: 'readonly',
      alert: 'readonly',
      confirm: 'readonly',
      prompt: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',

      // Node.js globals (for server files)
      console: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      global: 'readonly',
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',

      // Event and DOM globals
      Event: 'readonly',
      EventTarget: 'readonly',
      HTMLElement: 'readonly',
      HTMLDivElement: 'readonly',
      HTMLInputElement: 'readonly',
      HTMLCanvasElement: 'readonly',
      HTMLButtonElement: 'readonly',
      HTMLFormElement: 'readonly',
      Element: 'readonly',
      Node: 'readonly',
    },
  },
  plugins: {
    '@typescript-eslint': typescript,
    react,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': [
      'warn', // Downgrade to warning
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|Suspense', // Allow Suspense to be unused
        caughtErrorsIgnorePattern: '^_|error',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-var-requires': 'error',

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/no-unescaped-entities': 'warn',

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React Refresh rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // General rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Use TypeScript version instead
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-eval': 'warn', // Downgrade to warning for math evaluation
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-constant-binary-expression': 'warn', // Downgrade to warning
    'no-useless-escape': 'warn', // Downgrade to warning
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}, {
  files: ['**/*.{js,jsx}'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      // React globals
      React: 'readonly',

      // Browser globals
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      location: 'readonly',
      history: 'readonly',
      localStorage: 'readonly',
      sessionStorage: 'readonly',
      fetch: 'readonly',
      alert: 'readonly',
      confirm: 'readonly',
      prompt: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',

      // Node.js globals
      console: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      global: 'readonly',
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',

      // Event and DOM globals
      Event: 'readonly',
      EventTarget: 'readonly',
      HTMLElement: 'readonly',
      HTMLDivElement: 'readonly',
      HTMLInputElement: 'readonly',
      HTMLCanvasElement: 'readonly',
      HTMLButtonElement: 'readonly',
      HTMLFormElement: 'readonly',
      Element: 'readonly',
      Node: 'readonly',
    },
  },
  plugins: {
    react,
    'react-hooks': reactHooks,
  },
  rules: {
    // JavaScript-specific rules
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_|error',
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}, {
  files: ['server/**/*.{ts,js}'],
  languageOptions: {
    globals: {
      console: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      global: 'readonly',
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',
    },
  },
  rules: {
    // Allow console in server files
    'no-console': 'off',
  },
}, {
  files: [
    '**/*.test.{ts,tsx,js,jsx}',
    '**/__tests__/**/*.{ts,tsx,js,jsx}',
    '**/test/**/*.{ts,tsx,js,jsx}',
  ],
  languageOptions: {
    globals: {
      // Vitest globals
      vi: 'readonly',
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',

      // Browser globals for tests
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      location: 'readonly',
      history: 'readonly',
      localStorage: 'readonly',
      sessionStorage: 'readonly',
      fetch: 'readonly',
      console: 'readonly',

      // DOM globals for tests
      Event: 'readonly',
      EventTarget: 'readonly',
      HTMLElement: 'readonly',
      HTMLDivElement: 'readonly',
      HTMLInputElement: 'readonly',
      HTMLCanvasElement: 'readonly',
      HTMLButtonElement: 'readonly',
      HTMLFormElement: 'readonly',
      Element: 'readonly',
      Node: 'readonly',
    },
  },
  rules: {
    // Relax rules for test files
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
    'no-undef': 'off', // Vitest globals are handled above
  },
}, {
  ignores: [
    'dist/**',
    'node_modules/**',
    'build/**',
    '*.config.js',
    '*.config.ts',
    'vite.config.ts',
    'vitest.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
    'script.js', // Exclude the problematic script.js file
    'client/src/test-lazy-loading.tsx', // Exclude test file with unused imports
  ],
}, // Must be last to override other configs
prettier, ...storybook.configs["flat/recommended"]];
