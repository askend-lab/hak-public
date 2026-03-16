module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: false }],
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "text", "lcov"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
