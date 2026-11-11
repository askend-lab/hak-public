/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "pnpm",
  plugins: ["@stryker-mutator/jest-runner"],
  reporters: ["clear-text", "progress", "json"],
  testRunner: "jest",
  jest: {
    projectType: "custom",
    configFile: "jest.config.cjs"
  },
  coverageAnalysis: "perTest",
  mutate: [
    "src/**/*.ts",
    "!src/**/*.test.ts"
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  },
  timeoutMS: 30000
};
