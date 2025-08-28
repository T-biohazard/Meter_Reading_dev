// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tailwind from 'eslint-plugin-tailwindcss';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  // ignore build artifacts
  globalIgnores(['dist', 'build', '.vite', 'coverage']),
  // Node context for config files
  {
    files: [
      '*.{config,cjs,mjs}.js',
      'vite.config.*',
      'tailwind.config.*',
      'postcss.config.*',
      'eslint.config.*',
    ],
    languageOptions: { globals: globals.node },
  },
  // App source (React + browser)
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      react.configs.recommended,                // React core rules
      reactHooks.configs['recommended-latest'], // Hooks rules
      jsxA11y.configs.recommended,              // Accessibility
      tailwind.configs.recommended,             // Tailwind class checks
      reactRefresh.configs.vite,                // HMR safety
      prettier,                                 // Disable stylistic rules; let Prettier handle format
    ],
    settings: {
      react: { version: 'detect' },
      tailwindcss: {
        callees: ['clsx', 'twMerge', 'classnames'], // recognize these helpers
        config: 'tailwind.config.js',
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Your original tweak
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // Small React quality-of-life
      'react/react-in-jsx-scope': 'off',       // not needed with new JSX transform
      'react/jsx-no-target-blank': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
]);
