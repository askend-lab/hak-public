module.exports = {
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    'packages/*/src/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
  ],
  testMatch: [
    '<rootDir>/test/**/*.test.{js,ts}',
    '<rootDir>/packages/*/test/**/*.test.{js,ts}',
    '<rootDir>/packages/*/src/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/singletablelambda/',
    'synthesis.integration.test.ts',
    'Header.test.tsx',
    'features/tasks/store.test.ts',
    'context.test.tsx',
  ],
  modulePathIgnorePatterns: ['/singletablelambda/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
