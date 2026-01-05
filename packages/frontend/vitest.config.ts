import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hak/shared': path.resolve(__dirname, '../shared/src'),
      '@hak/specifications': path.resolve(__dirname, '../specifications'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    poolOptions: {
      threads: {
        isolate: false,
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: [
      'node_modules',
      'src/services/audio/synthesis.integration.test.ts',
    ],
    reporters: ['default', 'json'],
    outputFile: 'jest-results.json',
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.test.{ts,tsx}', 'src/features/steps-ts/**'],
    },
  },
});
