/**
 * HAK ESLint Configuration
 * Extends base config from DevBox with project-specific overrides
 */
import baseConfig from '../../boxer/devbox/eslint.config.js';

const TEST_FILE_PATTERNS = [
  '**/*.test.js', '**/*.spec.js', '**/test/**/*.js', 
  '**/tests/**/*.js', '**/__tests__/**/*.js', 
  '**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx'
];

export default [
  ...baseConfig,
  
  {
    ignores: ['tmp/**', 'packages/vendor/**', '**/.esbuild/**', '**/dist/**', '**/.old-frontend/**']
  },

  // Disable rules not compatible with current plugin versions
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts', '**/*.tsx'],
    rules: {
      'import/no-unresolved': 'off'
    }
  },

  // Fix jest rules for test files
  {
    files: TEST_FILE_PATTERNS,
    rules: {
      'jest/no-standalone-expect': 'off',
      'jest/no-disabled-tests': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },

  // Browser code: disallow Node.js globals
  {
    files: ['packages/frontend/src/**/*.ts', 'packages/frontend/src/**/*.tsx', 'packages/shared/src/**/*.ts'],
    ignores: [...TEST_FILE_PATTERNS, '**/vite.config.ts', '**/vitest.config.ts'],
    rules: {
      'no-restricted-globals': ['error', 
        { name: 'process', message: 'Use import.meta.env for Vite or check typeof process first' },
        { name: 'Buffer', message: 'Buffer is not available in browsers' },
        { name: '__dirname', message: '__dirname is not available in browsers' },
        { name: '__filename', message: '__filename is not available in browsers' }
      ]
    }
  }
];
