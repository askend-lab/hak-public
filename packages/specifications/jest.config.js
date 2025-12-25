module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/e2e/**/*.test.ts', '<rootDir>/parser/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'text', 'lcov'],
  collectCoverageFrom: ['parser/**/*.ts', '!parser/**/*.test.ts'],
};
