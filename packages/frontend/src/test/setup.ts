import '@testing-library/jest-dom'

// Mock import.meta.env for Vite compatibility
Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: { VITE_API_URL: '/api' } } },
});

// Jest DOM matchers for testing-library
