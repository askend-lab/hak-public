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

const HOOKS_FILE_PATTERNS = ["**/hooks/**/*.ts"];
const SERVICE_FILE_PATTERNS = ["**/services/**/*.ts", "**/services/**/*.tsx", "**/repository/**/*.ts"];
const FRONTEND_UTIL_PATTERNS = ["packages/frontend/src/utils/**/*.ts", "packages/frontend/src/types/**/*.ts", "packages/frontend/src/**/utils/**/*.ts"];

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

  // Generated files — auto-generated code, skip quality rules
  {
    files: GENERATED_FILE_PATTERNS,
    rules: {
      "max-lines": "off",
      "max-statements": "off",
      "max-lines-per-function": "off",
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
    files: HOOKS_FILE_PATTERNS,
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

  // === QS-1 MIGRATION: TS/TSX now uses same base limits as JS ===
  // All threshold rules inherited from base config (no overrides).
  // Base limits: complexity 8, cognitive-complexity 8, max-statements 10,
  // max-lines-per-function 30, max-nested-callbacks 2, max-depth 3, max-params 3.
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // --- STYLE-ONLY: disabled for TS (intentional patterns) ---
      "no-nested-ternary": "off",    // TSX conditional rendering uses nested ternaries
      "promise/prefer-await-to-then": "off", // .then() chains in event handlers are idiomatic
      "promise/prefer-await-to-callbacks": "off", // callback patterns in event handlers
      "unicorn/no-useless-undefined": "off", // conflicts with TS strict params

      // --- THRESHOLD: raised to 4 (default 3), steps-ts/test files excluded ---
      "sonarjs/no-duplicate-string": ["error", { "threshold": 4 }],
    },
  },

  // --- Post-QS-1 overrides (must come AFTER QS-1 block which applies to all .ts/.tsx) ---

  // React hooks compose multiple useState/useCallback/useEffect — inherently need
  // more statements, lines, and branching than plain utility functions.
  {
    files: HOOKS_FILE_PATTERNS,
    rules: {
      "max-statements": ["error", 20],
      "max-lines-per-function": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }],
      "max-nested-callbacks": ["error", 3],
      "complexity": ["error", 15],
      "sonarjs/cognitive-complexity": ["error", 15],
      "max-params": ["error", 5],
    },
  },

  // Service classes and auth/config modules have complex orchestration logic
  {
    files: SERVICE_FILE_PATTERNS,
    rules: {
      "max-statements": ["error", 15],
      "max-lines-per-function": ["error", { max: 60, skipBlankLines: true, skipComments: true }],
      "complexity": ["error", 12],
      "sonarjs/cognitive-complexity": ["error", 12],
      "max-params": ["error", 4],
    },
  },

  // Frontend utilities handle diverse input types with branching validation
  {
    files: FRONTEND_UTIL_PATTERNS,
    rules: {
      "max-statements": ["error", 15],
      "complexity": ["error", 12],
      "sonarjs/cognitive-complexity": ["error", 12],
    },
  },

  // TSX components compose multiple useState/useCallback — same rationale as hooks.
  // Default parameter values in React props each add a branch to cyclomatic complexity,
  // so TSX components with many optional props need a higher limit.
  {
    files: ["**/*.tsx"],
    rules: {
      "max-statements": ["error", 18],
      "complexity": ["error", 30],
      "sonarjs/cognitive-complexity": ["error", 18],
    },
  },

  // Generated files — skip size rules
  {
    files: GENERATED_FILE_PATTERNS,
    rules: {
      "max-lines": "off",
      "max-statements": "off",
      "max-lines-per-function": "off",
    },
  },


  // Test overrides (must come AFTER hooks block to override max-nested-callbacks for test files in hooks dirs)
  {
    files: TEST_FILE_PATTERNS,
    rules: {
      "max-classes-per-file": "off",
      "no-await-in-loop": "off",
      "promise/always-return": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-statements": "off",
      "complexity": "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-duplicate-string": "off",
      "no-param-reassign": "off",
      "max-nested-callbacks": ["error", 10],
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
