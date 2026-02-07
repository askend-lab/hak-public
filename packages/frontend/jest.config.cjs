module.exports = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost:3000",
  },
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "synthesis.integration.test.ts",
    "Header.test.tsx",
    "features/tasks/store.test.ts",
    "context.test.tsx",
  ],
  globals: {
    "import.meta": {
      env: {
        PROD: false,
        VITE_API_URL: "/api",
        VITE_VABAMORF_URL: "/api/analyze",
        VITE_MERLIN_URL: "/api/synthesize",
        VITE_API_BASE_URL: "/api",
      },
    },
  },
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "text", "lcov"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/test/**"],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },
};
