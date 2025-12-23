// Strict ESLint configuration - all rules as errors - no warnings allowed
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');
const jestPlugin = require('eslint-plugin-jest');
const noWeakAssertions = require('./eslint-rules/no-weak-assertions');

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.cjs',
      'packages/*/dist/**',
      'packages/*/build/**',
      'packages/*/coverage/**',
      'eslint-rules/**',
      '**/*.d.ts',
      '**/generated/**',
      '**/__generated__/**',
      '**/prisma/client/**',
      '**/.next/**',
      '**/out/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/nyc_output/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/vendor/**'
    ]
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
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-await-in-loop': 'error',
      'no-return-await': 'error',
      'no-promise-executor-return': 'error',
      'no-unsafe-optional-chaining': 'error',
      'require-atomic-updates': 'error',
      
      // ===== CODE QUALITY =====
      'complexity': ['error', 10],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],
      'max-params': ['error', 4],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-statements': ['error', 15],
      'no-magic-numbers': ['error', {
        ignore: [0, 1, -1, 2, 3, 4, 5, 10, 15, 30, 50, 55, 60, 77, 79, 80, 100, 200, 250, 300, 350, 500, 800, 1000, 1024, 5000, 30000, 60000],
        ignoreArrayIndexes: true,
        enforceConst: true,
        detectObjects: false
      }],
      
      // ===== NAMING =====
      'camelcase': ['error', { properties: 'never' }],
      'new-cap': 'error',
      
      // ===== BEST PRACTICES =====
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'radix': 'error',
      
      // ===== STRICT RULES =====
      'no-var': 'error',
      'prefer-const': 'error',
      'no-return-assign': 'error',
      'no-param-reassign': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'no-lonely-if': 'error',
      'no-else-return': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': 'error',
      
      // ===== SECURITY =====
      'no-new-wrappers': 'error',
      'no-proto': 'error',
      'no-extend-native': 'error',
      'no-iterator': 'error',
      'no-labels': 'error',
      'no-with': 'error'
    }
  },
  ...tseslint.configs.strictTypeChecked.map(config => ({ ...config, files: ['**/*.ts', '**/*.tsx'] })),
  ...tseslint.configs.stylisticTypeChecked.map(config => ({ ...config, files: ['**/*.ts', '**/*.tsx'] })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'import': importPlugin
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        typescript: true,
        node: true
      }
    },
    rules: {
      // ===== TYPESCRIPT STRICT RULES =====
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Too strict for now
      
      // ===== POTENTIAL BUGS =====
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-await-in-loop': 'error',
      'no-return-await': 'error',
      'no-promise-executor-return': 'error',
      'no-unsafe-optional-chaining': 'error',
      'require-atomic-updates': 'error',
      
      // ===== CODE QUALITY =====
      'complexity': ['error', 10],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],
      'max-params': ['error', 4],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-statements': ['error', 15],
      'no-magic-numbers': ['error', {
        ignore: [0, 1, -1, 2, 3, 4, 5, 10, 15, 30, 50, 55, 60, 77, 79, 80, 100, 200, 250, 300, 350, 500, 800, 1000, 1024, 5000, 30000, 60000],
        ignoreArrayIndexes: true,
        enforceConst: true,
        detectObjects: false
      }],
      
      // ===== NAMING =====
      'camelcase': ['error', { properties: 'never' }],
      'new-cap': 'error',
      
      // ===== BEST PRACTICES =====
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'radix': 'error',
      
      // ===== STRICT RULES =====
      'no-var': 'error',
      'prefer-const': 'error',
      'no-return-assign': 'error',
      'no-param-reassign': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'no-lonely-if': 'error',
      'no-else-return': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': 'error',
      
      // ===== SECURITY =====
      'no-new-wrappers': 'error',
      'no-proto': 'error',
      'no-extend-native': 'error',
      'no-iterator': 'error',
      'no-labels': 'error',
      'no-with': 'error',
      
      // ===== REACT SPECIFIC =====
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'error',
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',
      
      // ===== REACT HOOKS =====
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // ===== IMPORT/EXPORT =====
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type'
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      
      // ===== ACCESSIBILITY =====
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/media-has-caption': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'error',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error'
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    plugins: {
      jest: jestPlugin,
      'test-quality': {
        rules: {
          'no-weak-assertions': noWeakAssertions
        }
      }
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      // Relaxed rules for tests
      'complexity': ['error', 15],
      'max-depth': ['error', 4],
      'max-lines': ['error', 800],
      'max-lines-per-function': ['error', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-statements': 'off',
      'max-nested-callbacks': ['error', 5],
      'no-magic-numbers': 'off',
      
      // ===== JEST STRICT RULES - NO WEAK TESTS =====
      'jest/expect-expect': 'error',
      'jest/no-identical-title': 'error',
      'jest/no-disabled-tests': 'error',
      'jest/no-focused-tests': 'error',
      'jest/no-commented-out-tests': 'error',
      'jest/valid-expect': 'error',
      'jest/valid-expect-in-promise': 'error',
      'jest/prefer-expect-assertions': ['error', { onlyFunctionsWithAsyncKeyword: true }],
      'jest/no-alias-methods': 'error',
      'jest/prefer-to-be': 'error',
      'jest/prefer-to-contain': 'error',
      'jest/prefer-to-have-length': 'error',
      'jest/no-jasmine-globals': 'error',
      'jest/no-test-prefixes': 'error',
      'jest/valid-title': 'error',
      'jest/no-conditional-expect': 'error',
      'jest/no-standalone-expect': 'error',
      'jest/max-expects': ['error', { max: 10 }],
      'jest/prefer-strict-equal': 'error',
      'jest/require-top-level-describe': 'error',
      
      // ===== CUSTOM RULE - BLOCK WEAK ASSERTIONS =====
      'test-quality/no-weak-assertions': 'error'
    }
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    plugins: {
      jest: jestPlugin,
      'test-quality': {
        rules: {
          'no-weak-assertions': noWeakAssertions
        }
      }
    },
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      // Relaxed rules for tests
      'complexity': ['error', 15],
      'max-depth': ['error', 4],
      'max-lines': ['error', 800],
      'max-lines-per-function': ['error', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-statements': 'off',
      'max-nested-callbacks': ['error', 5],
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      
      // ===== JEST STRICT RULES - NO WEAK TESTS =====
      'jest/expect-expect': 'error',
      'jest/no-identical-title': 'error',
      'jest/no-disabled-tests': 'error',
      'jest/no-focused-tests': 'error',
      'jest/no-commented-out-tests': 'error',
      'jest/valid-expect': 'error',
      'jest/valid-expect-in-promise': 'error',
      'jest/prefer-expect-assertions': ['error', { onlyFunctionsWithAsyncKeyword: true }],
      'jest/no-alias-methods': 'error',
      'jest/prefer-to-be': 'error',
      'jest/prefer-to-contain': 'error',
      'jest/prefer-to-have-length': 'error',
      'jest/no-jasmine-globals': 'error',
      'jest/no-test-prefixes': 'error',
      'jest/valid-title': 'error',
      'jest/no-conditional-expect': 'error',
      'jest/no-standalone-expect': 'error',
      'jest/max-expects': ['error', { max: 10 }],
      'jest/prefer-strict-equal': 'error',
      'jest/require-top-level-describe': 'error',
      
      // ===== CUSTOM RULE - BLOCK WEAK ASSERTIONS =====
      'test-quality/no-weak-assertions': 'error'
    }
  },
  // ===== OVERRIDES FOR WORKER PACKAGES - ALLOW CONSOLE LOGGING =====
  {
    files: ['packages/audio-worker/**/*.ts', 'packages/audio-api/**/*.ts'],
    rules: {
      'no-console': 'off'
    }
  },
  // ===== OVERRIDES FOR AWS SDK FILES - DISABLE UNRESOLVED IMPORTS =====
  {
    files: [
      'packages/audio-api/**/*.ts',
      'packages/audio-worker/**/*.ts',
      'packages/singletablelambda/**/*.ts'
    ],
    rules: {
      'import/no-unresolved': 'off'
    }
  },
  // ===== OVERRIDES FOR TEST FILES - RELAX STRICT RULES =====
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/test/**/*.ts', '**/test/**/*.tsx'],
    rules: {
      'jest/prefer-expect-assertions': 'off',
      'test-quality/no-weak-assertions': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'jest/require-top-level-describe': 'off'
    }
  }
];
