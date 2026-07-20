import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    ignores: ['node_modules/**', 'vendor/**', 'eslint.config.js', 'vitest.config.js'],
  },

  {
    files: ['**/*.test.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  {
    files: ['**/*.js'],
    ignores: ['**/*.test.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'no-var': 'error',
    },
  },
];
