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
    '!packages/frontend/**', // Frontend uses Vitest now
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/main.tsx',
    '!**/vite-env.d.ts',
    '!**/declarations.d.ts',
    '!**/i18n.ts',
  ],
  testMatch: [
    '<rootDir>/packages/*/test/**/*.test.{js,ts}',
    '<rootDir>/packages/*/src/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    SIMPLESTORE_PATH,
    '/packages/frontend/', // Frontend uses Vitest now
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
