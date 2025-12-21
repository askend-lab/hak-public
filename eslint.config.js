// Strict ESLint configuration for hak - adapted from devbox
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: ['**/test/fixtures/**']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      // ===== POTENTIAL BUGS =====
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-await-in-loop': 'warn',
      'no-return-await': 'warn',
      'no-promise-executor-return': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'require-atomic-updates': 'warn',

      // ===== CODE QUALITY =====
      'complexity': ['warn', 10],
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 3],
      'max-params': ['warn', 4],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-statements': ['warn', 15],
      'no-magic-numbers': ['warn', {
        ignore: [0, 1, -1, 2, 3, 4, 5, 10, 15, 30, 50, 55, 60, 77, 79, 80, 100, 200, 250, 300, 350, 500, 800, 1000, 1024, 5000, 30000, 60000],
        ignoreArrayIndexes: true,
        enforceConst: true,
        detectObjects: false
      }],

      // ===== NAMING =====
      'camelcase': ['warn', { properties: 'never' }],
      'new-cap': 'warn',

      // ===== BEST PRACTICES =====
      'eqeqeq': ['warn', 'always'],
      'no-eval': 'warn',
      'no-implied-eval': 'warn',
      'no-new-func': 'warn',
      'no-script-url': 'warn',
      'no-throw-literal': 'warn',
      'prefer-promise-reject-errors': 'warn',
      'radix': 'warn',

      // ===== STRICT RULES =====
      'no-var': 'warn',
      'prefer-const': 'warn',
      'no-return-assign': 'warn',
      'no-param-reassign': 'warn',
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'warn',
      'no-lonely-if': 'warn',
      'no-else-return': 'warn',
      'prefer-template': 'warn',
      'prefer-arrow-callback': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      'object-shorthand': 'warn',

      // ===== SECURITY =====
      'no-new-wrappers': 'warn',
      'no-proto': 'warn',
      'no-extend-native': 'warn',
      'no-iterator': 'warn',
      'no-labels': 'warn',
      'no-with': 'warn'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        EventTarget: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLSelectElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        FocusEvent: 'readonly',
        InputEvent: 'readonly',
        SubmitEvent: 'readonly',
        Audio: 'readonly',
        AudioContext: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        MediaRecorder: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly'
      }
    },
    rules: {
      // ===== POTENTIAL BUGS =====
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-await-in-loop': 'warn',
      'no-return-await': 'warn',
      'no-promise-executor-return': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'require-atomic-updates': 'warn',

      // ===== CODE QUALITY =====
      'complexity': ['warn', 10],
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 3],
      'max-params': ['warn', 4],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-statements': ['warn', 15],
      'no-magic-numbers': ['warn', {
        ignore: [0, 1, -1, 2, 3, 4, 5, 10, 15, 30, 50, 55, 60, 77, 79, 80, 100, 200, 250, 300, 350, 500, 800, 1000, 1024, 5000, 30000, 60000],
        ignoreArrayIndexes: true,
        enforceConst: true,
        detectObjects: false
      }],

      // ===== NAMING =====
      'camelcase': ['warn', { properties: 'never' }],
      'new-cap': 'warn',

      // ===== BEST PRACTICES =====
      'eqeqeq': ['warn', 'always'],
      'no-eval': 'warn',
      'no-implied-eval': 'warn',
      'no-new-func': 'warn',
      'no-script-url': 'warn',
      'no-throw-literal': 'warn',
      'prefer-promise-reject-errors': 'warn',
      'radix': 'warn',

      // ===== STRICT RULES =====
      'no-var': 'warn',
      'prefer-const': 'warn',
      'no-return-assign': 'warn',
      'no-param-reassign': 'warn',
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'warn',
      'no-lonely-if': 'warn',
      'no-else-return': 'warn',
      'prefer-template': 'warn',
      'prefer-arrow-callback': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      'object-shorthand': 'warn',

      // ===== SECURITY =====
      'no-new-wrappers': 'warn',
      'no-proto': 'warn',
      'no-extend-native': 'warn',
      'no-iterator': 'warn',
      'no-labels': 'warn',
      'no-with': 'warn'
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/*.test.ts', '**/*.test.tsx', '**/test/**/*.js', '**/test/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        test: 'readonly'
      }
    },
    rules: {
      // Relaxed rules for tests
      'complexity': ['warn', 15],
      'max-depth': ['warn', 4],
      'max-lines': ['warn', 800],
      'max-lines-per-function': ['warn', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-statements': 'off',
      'max-nested-callbacks': ['warn', 5],
      'no-magic-numbers': 'off'
    }
  },
  {
    files: ['singletablelambda/**/*.ts'],
    rules: {
      'no-console': 'off',
      'max-statements': 'off'
    }
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      'docs/**',
      'drafts/**',
      'infra/**',
      'plans/**',
      'retrospectives/**'
    ]
  }
];
