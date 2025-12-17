import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for react-router-dom v7
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock import.meta.env for Vite compatibility
Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: { VITE_API_URL: '/api' } } },
});
