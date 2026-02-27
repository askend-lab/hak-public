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
  "**/__mocks__/**/*.ts",
  "**/e2e/**/*.ts",
  "**/steps-ts/**/*.ts",
  "**/*.test.ts",
  "**/*.spec.ts",
  "**/*.test.tsx",
  "**/*.spec.tsx",
];

const GENERATED_FILE_PATTERNS = [
  "**/*.generated.ts",
  "**/*.generated.tsx",
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
      "internal/pentests/**",
    ],
  },

  // Disable rules not compatible with current plugin versions
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs", "**/*.ts", "**/*.tsx"],
    rules: {
      "import/no-unresolved": "off",
    },
  },

  // === UNIFIED QUALITY ===
  // Logic complexity is uniform: complexity 8, cognitive-complexity 8 everywhere.
  // Size limits adapted to format: JSX markup ≠ imperative logic.
  //   .ts:  max-statements 10, max-lines-per-function 30 (base defaults)
  //   .tsx: max-statements 15, max-lines-per-function 60 (JSX markup is declarative)
  //   hooks: max-statements 15, max-lines-per-function 60 (compose multiple hooks)
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Style-only: disabled for TS (intentional patterns)
      "no-nested-ternary": "off",
      "promise/prefer-await-to-then": "off",
      "promise/prefer-await-to-callbacks": "off",
      "unicorn/no-useless-undefined": "off",
      "sonarjs/no-duplicate-string": ["error", { "threshold": 4 }],

      // Uniform logic complexity — same everywhere
      "complexity": ["error", 8],
      "sonarjs/cognitive-complexity": ["error", 8],
      "max-depth": ["error", 3],
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 30, skipBlankLines: true, skipComments: true }],
    },
  },

  // TSX components: adapted size limits (JSX markup is declarative, not logic)
  {
    files: ["**/*.tsx"],
    rules: {
      "max-statements": ["error", 15],
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true, skipComments: true }],
    },
  },

  // React hooks compose multiple useState/useCallback/useEffect
  {
    files: ["**/hooks/**/*.ts"],
    rules: {
      "max-statements": ["error", 15],
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true, skipComments: true }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  // Generated files — auto-generated code, skip quality rules
  {
    files: GENERATED_FILE_PATTERNS,
    rules: {
      "max-lines": "off",
      "max-statements": "off",
      "max-lines-per-function": "off",
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

  // Test files — moderate quality rules (prevent monster files, allow test flexibility)
  {
    files: TEST_FILE_PATTERNS,
    rules: {
      "jest/no-standalone-expect": "off",
      "jest/no-disabled-tests": "off",
      "jest/require-top-level-describe": "off",
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 150, skipBlankLines: true, skipComments: true }],
      "max-statements": ["error", 30],
      "complexity": "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-duplicate-string": "off",
      "max-nested-callbacks": ["error", 10],
      "max-classes-per-file": "off",
      "no-await-in-loop": "off",
      "no-console": "off",
      "no-param-reassign": "off",
      "no-promise-executor-return": "off",
      "promise/param-names": "off",
      "promise/prefer-await-to-callbacks": "off",
      "promise/prefer-await-to-then": "off",
      "promise/always-return": "off",
      "max-params": ["error", 6],
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
