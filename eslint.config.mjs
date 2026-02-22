/**
 * HAK ESLint Configuration
 * Extends base config from DevBox with project-specific overrides
 */
import baseConfig from "./eslint.base.config.mjs";

const TEST_FILE_PATTERNS = [
  "**/*.test.js",
  "**/*.spec.js",
  "**/test/**/*.js",
  "**/test/**/*.ts",
  "**/tests/**/*.js",
  "**/__tests__/**/*.js",
  "**/*.test.ts",
  "**/*.spec.ts",
  "**/*.test.tsx",
  "**/*.spec.tsx",
];

export default [
  ...baseConfig,

  {
    ignores: [
      "eslint.base.config.mjs",
      "packages/vendor/**",
      "**/.esbuild/**",
      "**/dist/**",
      "**/.old-frontend/**",
      "**/e2e/accessibility.spec.ts",
      "test-results/**",
      "playwright-report/**",
      ".lhci/**",
      "**/.stryker-tmp/**",
      "**/.venv/**",
      ".playwright-browsers/**",
    ],
  },

  // Disable rules not compatible with current plugin versions
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs", "**/*.ts", "**/*.tsx"],
    rules: {
      "import/no-unresolved": "off",
    },
  },

  // Fix jest rules for test files
  {
    files: TEST_FILE_PATTERNS,
    rules: {
      "jest/no-standalone-expect": "off",
      "jest/no-disabled-tests": "off",
      "jest/require-top-level-describe": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
    },
  },

  // React hooks return complex inferred objects — explicit return types add noise
  {
    files: ["**/hooks/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  // Test mock factories have complex inferred return types
  {
    files: [...TEST_FILE_PATTERNS, "**/mocks/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  // TSX components have higher cyclomatic complexity due to conditional rendering
  {
    files: ["**/*.tsx"],
    ignores: TEST_FILE_PATTERNS,
    rules: {
      "complexity": ["error", 30],
    },
  },

  // === QS-1 MIGRATION: newly active rules on .ts/.tsx ===
  // These rules were previously only applied to .js files.
  // Enable one at a time: fix violations → remove "off" → commit.
  // Track progress in CodeReviewMikkTracker.md § Quality System Improvements.
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // --- FIXED: curly, import/first, import/newline-after-import (auto-fix)
      // --- FIXED: sonarjs/no-redundant-jump, no-alert, max-depth, no-return-assign
      // --- FIXED: require-atomic-updates, security/detect-non-literal-regexp
      // --- FIXED: sonarjs/no-identical-functions, eslint-comments/require-description
      // --- FIXED: sonarjs/prefer-immediate-return, import/no-duplicates
      // --- FIXED: no-return-await, prefer-promise-reject-errors
      // --- FIXED: unicorn/prefer-spread, unicorn/explicit-length-check, regexp/prefer-w

      // --- TO FIX (disabled until violations resolved) ---
      "max-statements": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-nested-callbacks": "off",
      "max-params": "off",
      "max-classes-per-file": "off",
      "complexity": "off",
      "no-console": "off",
      "no-param-reassign": "off",
      "no-nested-ternary": "off",
      "no-await-in-loop": "off",
      "no-promise-executor-return": "off",
      "one-var": "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-duplicate-string": "off",
      "promise/prefer-await-to-then": "off",
      "promise/prefer-await-to-callbacks": "off",
      "promise/param-names": "off",
      "promise/always-return": "off",
      "unicorn/no-useless-undefined": "off", // conflicts with TS strict params
    },
  },

  // Browser code: disallow Node.js globals
  {
    files: [
      "packages/frontend/src/**/*.ts",
      "packages/frontend/src/**/*.tsx",
      "packages/shared/src/**/*.ts",
    ],
    ignores: [
      ...TEST_FILE_PATTERNS,
      "**/vite.config.ts",
      "**/vitest.config.ts",
    ],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "process",
          message: "Use import.meta.env for Vite or check typeof process first",
        },
        { name: "Buffer", message: "Buffer is not available in browsers" },
        {
          name: "__dirname",
          message: "__dirname is not available in browsers",
        },
        {
          name: "__filename",
          message: "__filename is not available in browsers",
        },
      ],
    },
  },
];
