import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@hak/shared": path.resolve(__dirname, "../shared/src"),
      "@hak/specifications": path.resolve(__dirname, "../specifications"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    poolOptions: {
      threads: {
        isolate: false,
        maxThreads: 10,
        minThreads: 4,
      },
    },
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: [
      "node_modules",
      "src/services/audio/synthesis.integration.test.ts",
    ],
    reporters: ["default", "json"],
    outputFile: "jest-results.json",
    forceRerunTriggers: ["**/vitest.config.*"],
    coverage: {
      provider: "v8",
      reporter: ["json-summary", "text", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.test.{ts,tsx}",
        "src/features/steps-ts/**",
        "**/testspecs/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/types/onboarding.ts",
        "src/types/task.ts",
        "src/hooks/index.ts",
        "src/components/onboarding/index.ts",
        "**/*.generated.ts",
        "**/testspecs/**/index.ts",
        "src/utils/warmAudioWorker.ts",
        "src/services/storage/MockDataLoader.ts",
        "src/pages/DebugPage.tsx",
        "src/services/auth/index.ts",
        "src/services/auth/types.ts",
        "src/utils/a11y-dev.ts",
        "src/services/__mocks__/**",
        "src/data/markerData.ts",
      ],
      reportOnFailure: true,
    },
  },
});
