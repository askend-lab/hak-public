/**
 * HAK ESLint Configuration
 * Extends base config from DevBox with project-specific overrides
 */
import baseConfig from '../../boxer/devbox/eslint.config.js';

export default [
  ...baseConfig,
  
  {
    ignores: [
      'eslint-rules/**',
      'test/features/sample.test.ts',
      'coverage/**',
      'coverage-features/**',
      'coverage-unit/**'
    ]
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
    files: ['**/*.test.js', '**/*.spec.js', '**/test/**/*.js', '**/tests/**/*.js', '**/__tests__/**/*.js', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'jest/no-standalone-expect': 'off',
      'jest/no-disabled-tests': 'off'
    }
  }
];
