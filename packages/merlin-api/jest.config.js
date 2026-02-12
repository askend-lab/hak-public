/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "text", "lcov"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};
