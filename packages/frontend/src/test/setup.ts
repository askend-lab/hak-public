import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { vi } from 'vitest';

// Polyfill TextEncoder/TextDecoder for react-router-dom v7
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Make vi available globally for jest.fn() compatibility
globalThis.jest = vi as unknown as typeof jest;
