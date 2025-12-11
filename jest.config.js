module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'text', 'lcov'],
  collectCoverageFrom: ['src/**/*.js'],
  testMatch: ['<rootDir>/test/**/*.test.js', '<rootDir>/packages/*/test/**/*.test.js'],
};
