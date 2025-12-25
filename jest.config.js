// Mock localStorage before jsdom initializes
const localStorageStore = {};
const SIMPLESTORE_PATH = '/simplestore/';
global.localStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, value) => { localStorageStore[key] = String(value); },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); },
  get length() { return Object.keys(localStorageStore).length; },
  key: (i) => Object.keys(localStorageStore)[i] || null,
};

module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  coverageDirectory: 'tmp/coverage',
  coverageReporters: ['json-summary', 'text', 'lcov'],
  collectCoverageFrom: [
    'packages/*/src/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/main.tsx',
    '!**/vite-env.d.ts',
    '!**/declarations.d.ts',
    '!**/i18n.ts',
    '!packages/frontend/src/services/audio/synthesis.integration.test.ts',
    '!packages/frontend/src/components/tests/TestSuiteCard.tsx',
    '!packages/frontend/src/components/tests/UnimplementedFeatures.tsx',
    '!packages/frontend/src/components/tests/test-card-helpers.ts',
    '!packages/frontend/src/components/synthesis/SentenceRow.tsx',
  ],
  testMatch: [
    '<rootDir>/packages/*/test/**/*.test.{js,ts}',
    '<rootDir>/packages/*/src/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    SIMPLESTORE_PATH,
    'packages/frontend/src/services/audio/synthesis.integration.test.ts',
    'features/tasks/store.test.ts',
    'context.test.tsx', // Skipped: needs aws-amplify mock setup
    'packages/frontend/src/services/audio/synthesis.test.ts',
    'packages/audio-api/test/features/', // Exclude audio-api E2E tests - run by audio-api module
  ],
  modulePathIgnorePatterns: [SIMPLESTORE_PATH],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
