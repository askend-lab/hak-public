/*
 * Universal ESLint configuration for JavaScript/TypeScript projects
 * Using ES module syntax for flat config (ESLint 9+)
 */

import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import nPlugin from 'eslint-plugin-n';
import promisePlugin from 'eslint-plugin-promise';
import regexpPlugin from 'eslint-plugin-regexp';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';
import reactPlugin from 'eslint-plugin-react';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';


// ===== CONFIGURATION CONSTANTS =====
const ECMA_VERSION = 2022;
const MAX_COMPLEXITY = 8;
const MAX_DEPTH = 3;
const MAX_NESTED_CALLBACKS = 2;
const MAX_PARAMS = 3;
const MAX_STATEMENTS = 10;
const MAX_LINES = 200;
const MAX_LINES_PER_FUNCTION = 30;
const MAX_CLASSES_PER_FILE = 1;
const MAX_LINE_LENGTH = 100;
const TAB_WIDTH = 2;
const SONARJS_COMPLEXITY = 8;
const SONARJS_THRESHOLD = 2;


// ===== SHARED RULE SETS =====
const baseRules = {
  'complexity': ['error', MAX_COMPLEXITY],
  'max-depth': ['error', MAX_DEPTH],
  'max-nested-callbacks': ['error', MAX_NESTED_CALLBACKS],
  'max-params': ['error', MAX_PARAMS],
  'max-statements': ['error', MAX_STATEMENTS],
  'max-lines': ['error', { max: MAX_LINES, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: MAX_LINES_PER_FUNCTION, skipBlankLines: true, skipComments: true }],
  'max-classes-per-file': ['error', MAX_CLASSES_PER_FILE],

  // Potential bugs
  'no-console': 'error',
  'no-debugger': 'error',
  'no-alert': 'error',
  'no-await-in-loop': 'error',
  'no-return-await': 'error',
  'no-promise-executor-return': 'error',
  'no-unsafe-optional-chaining': 'error',
  'require-atomic-updates': 'error',
  // Tech debt detection
  'no-warning-comments': ['warn', { terms: ['TODO', 'FIXME', 'HACK', 'XXX'], location: 'start' }],
  // Code style
  'curly': ['error', 'all'],
  'no-nested-ternary': 'error',
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  'no-script-url': 'error',
  'no-throw-literal': 'error',
  'prefer-promise-reject-errors': 'error',

  // Functional programming
  'prefer-const': ['error', { destructuring: 'all' }],
  'no-return-assign': ['error', 'always'],
  'no-param-reassign': ['error', { props: true }],
  'no-multi-assign': 'error',
  'one-var': ['error', 'never'],

  // No wrappers
  'no-new-wrappers': 'error',
  'no-proto': 'error',
  'no-extend-native': 'error',
  'no-iterator': 'error',
  'no-labels': 'error',
  'no-with': 'error'
};

const securityRules = {
  'security/detect-non-literal-regexp': 'error',
  'security/detect-unsafe-regex': 'error',
  'security/detect-buffer-noassert': 'error',
  'security/detect-child-process': 'error',
  'security/detect-disable-mustache-escape': 'error',
  'security/detect-eval-with-expression': 'error',
  'security/detect-non-literal-fs-filename': 'off',
  'security/detect-non-literal-require': 'error',
  'security/detect-possible-timing-attacks': 'error',
  'security/detect-pseudoRandomBytes': 'error'
};

const unicornRules = {
  'unicorn/prevent-abbreviations': 'off',
  'unicorn/no-array-method-this-argument': 'error',
  'unicorn/no-array-push-push': 'error',
  'unicorn/prefer-array-flat-map': 'error',
  'unicorn/prefer-array-some': 'error',
  'unicorn/no-useless-undefined': 'error',
  'unicorn/prefer-spread': 'error',
  'unicorn/explicit-length-check': 'error'
};

const sonarRules = {
  'sonarjs/cognitive-complexity': ['error', SONARJS_COMPLEXITY],
  'sonarjs/no-identical-functions': 'error',
  'sonarjs/no-duplicate-string': ['error', { threshold: SONARJS_THRESHOLD }],
  'sonarjs/no-nested-template-literals': 'error',
  'sonarjs/no-redundant-jump': 'error',
  'sonarjs/no-small-switch': 'error',
  'sonarjs/prefer-immediate-return': 'error',
  'sonarjs/prefer-object-literal': 'error',
  'sonarjs/prefer-single-boolean-return': 'error'
};

const promiseRules = {
  'promise/always-return': 'error',
  'promise/no-return-wrap': 'error',
  'promise/param-names': 'error',
  'promise/catch-or-return': ['error', { allowFinally: true }],
  'promise/no-nesting': 'error',
  'promise/no-promise-in-callback': 'error',
  'promise/no-callback-in-promise': 'error',
  'promise/no-return-in-finally': 'error',
  'promise/valid-params': 'error',
  'promise/prefer-await-to-then': 'error',
  'promise/prefer-await-to-callbacks': 'error'
};

const nodeRules = {
  'n/no-deprecated-api': 'error',
  'n/no-process-exit': 'error',
  'n/no-sync': 'off',
  'n/handle-callback-err': 'error',
  'n/prefer-global/buffer': 'off',
  'n/prefer-global/console': 'off',
  'n/prefer-global/process': 'off',
  'n/prefer-global/url': 'off',
  'n/prefer-global/url-search-params': 'off'
};

const eslintCommentsRules = {
  'eslint-comments/disable-enable-pair': 'error',
  'eslint-comments/no-aggregating-enable': 'error',
  'eslint-comments/no-duplicate-disable': 'error',
  'eslint-comments/no-unlimited-disable': 'error',
  'eslint-comments/no-unused-disable': 'error',
  'eslint-comments/no-unused-enable': 'error',
  'eslint-comments/require-description': 'error'
};

const regexpRules = {
  'regexp/no-unused-capturing-group': 'error',
  'regexp/no-useless-flag': 'error',
  'regexp/prefer-d': 'error',
  'regexp/prefer-w': 'error'
};

const importRules = {
  'import/no-cycle': ['error', { maxDepth: 1, ignoreExternal: true }],
  'import/no-deprecated': 'error',
  'import/no-mutable-exports': 'error',
  'import/no-amd': 'error',
  'import/first': 'error',
  'import/no-duplicates': 'error',
  'import/newline-after-import': ['error', { count: 1 }]
};

const commentRules = {
  'no-restricted-syntax': ['error',
    { selector: 'ForInStatement', message: 'for..in loops iterate over the entire prototype chain. Use Object.{keys,values,entries}.' },
    { selector: 'WithStatement', message: '`with` is disallowed in strict mode.' }
  ]
};

const jestRules = {
  'jest/expect-expect': 'error',
  'jest/no-identical-title': 'error',
  'jest/no-disabled-tests': 'error',
  'jest/no-focused-tests': 'error',
  'jest/no-commented-out-tests': 'error',
  'jest/valid-expect': 'error',
  'jest/valid-expect-in-promise': 'error',
  'jest/prefer-expect-assertions': 'off',
  'jest/no-alias-methods': 'error',
  'jest/prefer-to-be': 'error',
  'jest/prefer-to-contain': 'error',
  'jest/prefer-to-have-length': 'error',
  'jest/no-jasmine-globals': 'error',
  'jest/no-test-prefixes': 'error',
  'jest/valid-title': 'error',
  'jest/no-conditional-expect': 'off',
  'jest/no-standalone-expect': 'error',
  'jest/max-expects': ['error', { max: 10 }],
  'jest/prefer-strict-equal': 'error',
  'jest/require-top-level-describe': 'error'
};

const typescriptRules = {
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/explicit-function-return-type': 'error',
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }]
};

const nodeGlobals = {
  console: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  setImmediate: 'readonly',
  clearImmediate: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  module: 'readonly',
  require: 'readonly',
  exports: 'writable'
};

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  fetch: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly'
};


export default [
  // ===== GLOBAL IGNORES =====
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.git/**',
      '**/test/fixtures/**',
      'eslint.config.js',
      '**/hooks/*.js',
      '**/*.cjs'
    ]
  },

  // ===== JAVASCRIPT FILES =====
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    plugins: {
      sonarjs: sonarjsPlugin,
      import: importPlugin,
      security: securityPlugin,
      unicorn: unicornPlugin,
      promise: promisePlugin,
      n: nPlugin,
      'eslint-comments': eslintCommentsPlugin,
      regexp: regexpPlugin,
      jsdoc: jsdocPlugin
    },
    languageOptions: {
      ecmaVersion: ECMA_VERSION,
      sourceType: 'module',
      globals: nodeGlobals
    },
    settings: {
      'import/resolver': { node: true }
    },
    rules: {
      ...baseRules,
      ...securityRules,
      ...unicornRules,
      ...sonarRules,
      ...promiseRules,
      ...nodeRules,
      ...eslintCommentsRules,
      ...regexpRules,
      ...importRules,
      ...commentRules,
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-example': 'off'
    }
  },

  // ===== TYPESCRIPT FILES =====
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: ECMA_VERSION,
        sourceType: 'module'
      },
      globals: nodeGlobals
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin
    },
    settings: {
      'import/resolver': { node: true }
    },
    rules: typescriptRules
  },

  // ===== REACT/TSX FILES =====
  {
    files: ['**/*.tsx', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: ECMA_VERSION,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: browserGlobals
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react': reactPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'react/no-array-index-key': 'error',
      // React components are typically larger than utility functions
      'complexity': ['error', 20],
      'max-depth': ['error', 4],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      // Accessibility rules (WCAG 2.1 AA)
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error'
    }
  },

  // ===== CLI FILES =====
  {
    files: [
      '**/cli/**/*.js',
      '**/bin/**/*.js',
      '**/core/runner.js',
      'packages/test-runner/src/*.cjs',
      'packages/agent-system/lib/*.js',
      'scripts/*.js',
      'scripts/*.cjs'
    ],
    rules: {
      'no-console': 'off',
      'max-statements': 'off',
      'n/no-process-exit': 'off'
    }
  },

  // ===== SCRIPTS AND UTILITIES =====
  {
    files: [
      'scripts/**/*.js',
      '**/scripts/**/*.js',
      'packages/task-channel/**/*.js',
      'packages/agent-manager/backend/*.js',
      'packages/comhub/**/*.js'
    ],
    rules: {
      'no-console': 'off',
      'no-magic-numbers': 'off',
      'max-statements': 'off',
      'prefer-template': 'off',
      'n/no-process-exit': 'off'
    }
  },

  // ===== TEST FILES =====
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/test/**/*.js', '**/tests/**/*.js', '**/__tests__/**/*.js', '**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts', '**/tests/**/*.ts', '**/__tests__/**/*.ts'],
    plugins: {
      jest: jestPlugin,
      sonarjs: sonarjsPlugin
    },
    languageOptions: {
      ecmaVersion: ECMA_VERSION,
      sourceType: 'module',
      globals: {
        ...jestPlugin.environments.globals.globals,
        ...nodeGlobals
      }
    },
    rules: {
      ...jestRules,
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
      'complexity': ['error', 15],
      'max-depth': ['error', 4],
      'max-lines': ['error', 800],
      'max-lines-per-function': ['error', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-statements': 'off',
      'max-nested-callbacks': ['error', 5],
      'no-magic-numbers': 'off',
      'sonarjs/no-duplicate-string': 'off'
    }
  },

  // ===== CONFIG FILES =====
  {
    files: ['*.config.js', '**/*.config.js', '**/config/**/*.js'],
    rules: {
      'no-magic-numbers': 'off',
      'import/no-default-export': 'off'
    }
  }
];
