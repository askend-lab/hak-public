module.exports = {
  testEnvironment: 'node',
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
    'packages/frontend/src/services/audio/synthesis.test.ts',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
