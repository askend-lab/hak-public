// eslint-disable-next-line import/no-unresolved
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for react-router-dom v7
import { TextEncoder, TextDecoder } from 'util';

 
// @ts-expect-error - TextEncoder is not defined in jsdom
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TextEncoder polyfill for jsdom
global.TextEncoder = TextEncoder;
 
// @ts-expect-error - TextDecoder is not defined in jsdom
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TextDecoder polyfill for jsdom
global.TextDecoder = TextDecoder;

// Mock import.meta.env for Vite compatibility
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        PROD: false,
        DEV: true,
        MODE: 'test',
        BASE_URL: '/',
      },
    },
  },
});
