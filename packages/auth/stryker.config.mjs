/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "pnpm",
  plugins: ["@stryker-mutator/jest-runner"],
  reporters: ["clear-text", "progress", "json"],
  testRunner: "jest",
  jest: {
    projectType: "custom",
    configFile: "jest.config.js"
  },
  coverageAnalysis: "perTest",
  mutate: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/index.ts"
  ],
  thresholds: {
    high: 90,
    low: 80,
    break: 90
  },
  timeoutMS: 30000
};
