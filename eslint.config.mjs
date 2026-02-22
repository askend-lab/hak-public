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
      "max-nested-callbacks": ["error", 10], // describe > describe > it > callback nesting is normal
      "max-statements": ["error", 30], // test setup + assertions need more statements
      "sonarjs/no-duplicate-string": "off", // repeated test strings are idiomatic
      "no-console": "off", // test debugging output is acceptable
      "no-param-reassign": "off", // test mocks often reassign params
      "max-classes-per-file": "off", // test mock classes are co-located
      "no-promise-executor-return": "off", // test Promise executors often return for brevity
      "promise/param-names": "off", // test mocks use non-standard param names
      "promise/prefer-await-to-callbacks": "off", // test patterns use callbacks
      "promise/prefer-await-to-then": "off", // test assertions chain with .then
      "promise/always-return": "off", // test promise chains don't always return
      "max-params": ["error", 6], // test helpers take more params (mock deps)
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

      // --- STYLE-ONLY: disabled for TS (intentional patterns) ---
      "no-nested-ternary": "off",    // TSX conditional rendering uses nested ternaries
      "promise/prefer-await-to-then": "off", // .then() chains in event handlers are idiomatic
      "promise/prefer-await-to-callbacks": "off", // callback patterns in event handlers
      "unicorn/no-useless-undefined": "off", // conflicts with TS strict params

      // --- THRESHOLD ADJUSTMENTS ---
      "max-params": ["error", 5],    // hooks/handlers take 4-5 dependency params
      "max-classes-per-file": ["error", 3], // adapter files may co-locate related classes

      // --- STILL DISABLED (high violation count, fix incrementally) ---
      "max-statements": "off",       // src:101
      "max-lines-per-function": "off", // src:69
      "sonarjs/no-duplicate-string": "off", // src:63
      "no-console": "off",           // src:40
      "no-param-reassign": "off",    // src:38
      "max-nested-callbacks": "off", // src:30
      "max-lines": "off",            // src:25
      "complexity": "off",           // src:25
      "sonarjs/cognitive-complexity": "off", // src:22
    },
  },

  // Re-assert test overrides after QS-1 migration block (which applies to all .ts/.tsx)
  {
    files: TEST_FILE_PATTERNS,
    rules: {
      "max-classes-per-file": "off",
      "no-await-in-loop": "off", // test loops are intentional
      "promise/always-return": "off",
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
